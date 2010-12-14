#!/bin/bash

# This file is just for spludo core development.
# usage: (changes 1.0.3-dev to 1.0.4-dev)
#   ./build/core_dev_change_version_number.bash 1.0.3-dev 1.0.4-dev

cd `dirname $0`
cd ..

old_version="$1"
new_version="$2"

if [ "" == "$1"  ];
then
    echo "Usage: ./build/core_dev_change_version_number.bash 1.0.3-dev 1.0.4-dev"
    exit 1
fi

if [ "" == "$2"  ];
then
    echo "Usage: ./build/core_dev_change_version_number.bash 1.0.3-dev 1.0.4-dev"
    exit 1
fi

grep -R "$old_version" * | cut -f "1" -d ":" | while read line
do
    sed "s/$old_version/$new_version/g" -i  "$line"
done
