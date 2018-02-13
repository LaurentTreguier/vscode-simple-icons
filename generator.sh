#!/bin/bash

case "$OSTYPE" in
    darwin*)    sed_regex_option='-E' ;;
    *)          sed_regex_option='-r' ;;
esac

hash_sum=sha256sum

simple_name='simple-icons'
simple_source_dir="source/$simple_name"
simple_gen_dir="gen/$simple_name"
simple_icons_dir="icons/$simple_name"

mini_name='minimalistic-icons'
mini_source_dir="source/$mini_name"
mini_gen_dir="gen/$mini_name"
mini_icons_dir="icons/$mini_name"

function list_simple_icons() {
    files=

    for simple_dir in $simple_source_dir $simple_gen_dir
    do
        files="$files $(ls $simple_dir/* | grep -v '.light.svg')"
    done

    echo $files | sort -u
}

function get_folder_color() {
    grep -Eo '(rect|polygon)[^#]+fill="#[0-9a-f]{6}"' $1 | grep -Eo '#.{6}'
}

function validate_sums() {
    if [[ -f $1 ]] && [[ -f $2 ]]
    then
        sum="$(tail -1 $2 | grep -Eo '\w+' | head -1)"
        [[ "$($hash_sum $1 | grep -Eo '\w+' | head -1)" = "$sum" ]]
    else
        false
    fi
}

function comment_sum() {
    echo "<!-- $($hash_sum $1) -->"
}

npm run compile

mkdir -p {$simple_gen_dir,$simple_icons_dir,$mini_gen_dir,$mini_icons_dir}

for theme_source_dir in $mini_source_dir $simple_source_dir
do
    echo "Beautifying icons from $theme_source_dir"
    ./node_modules/.bin/svgo --config=.svgo.yml --multipass -f $theme_source_dir > /dev/null
done

for file in $(ls $simple_gen_dir)
do
    if [[ ! -f $simple_source_dir/${file/.expanded/} ]] || [[ -f $simple_source_dir/$file ]]
    then
        echo "Cleaning up unused file $simple_gen_dir/$file"
        rm -f $simple_gen_dir/$file
    fi
done

for file in $(ls $simple_icons_dir)
do
    if [[ ! -f $simple_source_dir/$file ]] && [[ ! -f $simple_gen_dir/$file ]]
    then
        echo "Cleaning up unused file $simple_icons_dir/$file"
        rm -f $simple_icons_dir/$file
    fi
done

for folder in $(ls $simple_source_dir/folder-*.svg | grep -v '.expanded.svg')
do
    expanded_folder=${folder/.svg/.expanded.svg}
    gen_folder=$simple_gen_dir/$(basename $expanded_folder)

    if ! validate_sums $folder $gen_folder && [[ ! -f $expanded_folder ]]
    then
        echo "Generating simple $(basename ${expanded_folder/.svg/})"
        old_color=$(get_folder_color $simple_source_dir/folder.expanded.svg)
        new_color=$(get_folder_color $folder)
        cp $simple_source_dir/folder.expanded.svg $gen_folder
        sed $sed_regex_option -i "s/$old_color/$new_color/g" $gen_folder
        comment_sum $folder >> $gen_folder
    fi
done

icon_sums=

for file in $(list_simple_icons)
do
    sum=$(cat $file | sed $sed_regex_option 's/"(#[0-9a-f]{6}|none)"//g' | sed 's/<!\-\-.*\-\->//g' | tr -d '[:space:]' | $hash_sum | grep -Eo '\w+' | head -1)
    icon_sums="$icon_sums $sum@$(basename $file)"
done

icon_redirects=$(echo $icon_sums | node generator.js redirect)

for mini_dir in $mini_gen_dir $mini_icons_dir
do
    for file in $(ls $mini_dir)
    do
        file=${file/.light/}

        if [[ ! -z $(echo $icon_redirects | grep -E "(^| )${file/.svg/}(.light)?.svg@") ]] \
            || ( [[ ! -f $simple_source_dir/$file ]] && [[ ! -f $simple_gen_dir/$file ]] )
        then
            file=${file/.svg/}

            for useless in $file{,.light}.svg
            do
                if [[ -f $mini_dir/$useless ]]
                then
                    echo "Cleaning up unused file $mini_dir/$useless"
                    rm -f $mini_dir/$useless
                fi
            done
        fi
    done
done

for file in $(list_simple_icons)
do
    file=$(basename $file)

    if echo $icon_redirects | grep -E "(^| )$file@" &> /dev/null
    then
        continue
    fi

    simple_dir=$simple_source_dir

    if [[ -f $simple_gen_dir/$file ]]
    then
        simple_dir=$simple_gen_dir
    fi

    if [[ -f $mini_source_dir/$file ]]
    then
        file_dir=$mini_source_dir
        rm -f $mini_gen_dir/$file
    else
        file_dir=$mini_gen_dir

        if ! validate_sums $simple_dir/$file $mini_gen_dir/$file
        then
            echo "Generating minimalistic $file"
            node generator.js gen < $simple_dir/$file > $mini_gen_dir/$file
            comment_sum $simple_dir/$file >> $mini_gen_dir/$file
        fi
    fi

    light_file=${file/.svg/.light.svg}

    if ! validate_sums $file_dir/$file $mini_gen_dir/$light_file
    then
        echo "Generating minimalistic $light_file"
        node generator.js light < $file_dir/$file > $mini_gen_dir/$light_file
        comment_sum $file_dir/$file >> $mini_gen_dir/$light_file
    fi
done

for theme_name in $mini_name $simple_name
do
    theme_source_dir=source/$theme_name
    theme_gen_dir=gen/$theme_name
    theme_icon_dir=icons/$theme_name
    icon_list="$(ls $theme_source_dir) $(ls $theme_gen_dir)"
    svgo_cmd="./node_modules/.bin/svgo --multipass -o $theme_icon_dir"

    if [[ $theme_name = $mini_name ]]
    then
        redirects=$icon_redirects
    else
        redirects=
    fi

    mkdir -p $theme_icon_dir
    echo "Writing $theme_name.json"
    node generator.js json $theme_icon_dir $redirects $(echo $icon_list | sort -u) < icons.json > $theme_name.json
    echo "Optimizing icons from $theme_source_dir"
    $svgo_cmd -f $theme_source_dir > /dev/null
    echo "Optimizing icons from $theme_gen_dir"
    $svgo_cmd -f $theme_gen_dir > /dev/null
done

for file in $(ls $simple_source_dir/*)
do
    markdown_list="$markdown_list$(basename $file)|<img width=\"16\" height=\"16\" src=\"$file\">@"
done

sed "s,@@ICONS@@,$(echo $markdown_list | sed 's/@/\\n/g'),g" < ICONS-template.md > ICONS.md

echo 'Done'
