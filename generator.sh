#!/bin/bash

mini_icons_dir='source/minimalistic-icons'
simple_icons_dir='source/simple-icons'

for file in $(ls $mini_icons_dir)
do
    light_file=$(echo $file | sed -r 's/svg$/light.svg/')

    if [[ ! $file = *.light.svg ]] && \
        ([[ ! -f $mini_icons_dir/$light_file ]] \
            || [[ $mini_icons_dir/$file -nt $mini_icons_dir/$light_file ]])
    then
        node generator.js conv < $mini_icons_dir/$file > $mini_icons_dir/$light_file
        echo "Generating $mini_icons_dir/$light_file"
    fi
done

for theme_dir in $mini_icons_dir $simple_icons_dir
do
    theme_name=$(basename $theme_dir)
    theme_icon_dir=$(echo $theme_dir | sed 's/source/icons/')
    node generator.js json $theme_icon_dir $(LC_ALL=C ls $theme_dir) < icons.json > $theme_name.json
    echo "Generating $theme_name.json"
    node ./node_modules/.bin/svgo -f $theme_dir -o $theme_icon_dir
done
