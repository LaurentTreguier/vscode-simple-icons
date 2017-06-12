#!/bin/bash

mini_name='minimalistic-icons'
simple_name='simple-icons'
mini_source_dir="source/$mini_name"
simple_source_dir="source/$simple_name"
mini_icons_dir="icons/$mini_name"
simple_icons_dir="icons/$simple_name"
mini_gen_dir="gen/$mini_name"

mkdir -p $mini_gen_dir
needed_icons=$(node generator.js fill < icons.json | sort | uniq)

for file in $needed_icons
do
    if [[ -f $mini_source_dir/$file ]]
    then
        file_dir=$mini_source_dir
        rm -f $mini_gen_dir/$file
    else if [[ $simple_source_dir/$file -nt $mini_gen_dir/$file ]]
        then
            file_dir=$mini_gen_dir
            echo "Generating minimalistic $file"
            node generator.js gen < $simple_source_dir/$file > $mini_gen_dir/$file
        fi
    fi

    light_file=$(echo $file | sed -r 's/svg$/light.svg/')

    if [[ ! -f $mini_gen_dir/$light_file ]] \
            || [[ $file_dir/$file -nt $mini_gen_dir/$light_file ]]
    then
        echo "Generating minimalistic $light_file"
        node generator.js light < $file_dir/$file > $mini_gen_dir/$light_file
    fi
done

for theme_dir in $mini_source_dir $simple_source_dir
do
    theme_name=$(basename $theme_dir)
    theme_icon_dir=icons/$theme_name
    icon_list=$(ls $theme_dir)
    svgo_cmd="node ./node_modules/.bin/svgo --multipass -o $theme_icon_dir"

    if [[ $theme_name = $mini_name ]]
    then
        icon_list="$icon_list $(ls $mini_gen_dir)"
    fi

    mkdir -p $theme_icon_dir
    echo "Generating $theme_name.json"
    node generator.js json $theme_icon_dir $(echo $icon_list) < icons.json > $theme_name.json
    echo "Optimizing icons from $theme_dir"
    $svgo_cmd -f $theme_dir > /dev/null

    if [[ $theme_name = $mini_name ]]
    then
        echo "Optimizing icons from $mini_gen_dir"
        $svgo_cmd -f $mini_gen_dir > /dev/null
    fi
done

for file in $(ls $simple_icons_dir)
do
    if [[ ! -f $simple_source_dir/$file ]]
    then
        echo "Cleaning unused simple icon $file"
        rm $simple_icons_dir/$file
    fi
done

for file in $(ls $mini_gen_dir)
do
    if [[ ! $file = *.light.svg ]] && [[ ! -f $simple_source_dir/$file ]]
    then
        echo "Cleaning unused minimalistic icon $file"
        rm -f {$mini_gen_dir,$mini_icons_dir}/{$file,$(echo $file | sed -r 's/svg$/light.svg/')}
    fi
done

echo 'Done'
