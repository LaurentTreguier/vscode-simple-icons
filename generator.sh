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

for theme in $mini_icons_dir $simple_icons_dir
do
    node generator.js json $(echo $theme | sed 's/source/icons/') $(ls $theme) < icons.json > $(basename $theme).json
    echo "Generating $theme.json"
done
