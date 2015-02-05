#!/bin/bash
#
# File:      pingi
#
# Purpose:   Ping Improved. Actually just handles better the timeout/unreachable.
#
# Author:    BRAGA, Bruno <bruno.braga@gmail.com>
#
# Copyright:
#
#            Licensed under the Apache License, Version 2.0 (the "License");
#            you may not use this file except in compliance with the License.
#            You may obtain a copy of the License at
#
#            http://www.apache.org/licenses/LICENSE-2.0
#
#            Unless required by applicable law or agreed to in writing, software
#            distributed under the License is distributed on an "AS IS" BASIS,
#            WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
#            implied. See the License for the specific language governing
#            permissions and limitations under the License.
#
host=$1

if [ -z $host ]; then
    echo "Usage: `basename $0` [HOST]"
    exit 1
fi

while :; do
    result=`ping -W 1 -c 1 $host | grep 'bytes from '`
    if [ $? -gt 0 ]; then
        echo -e "`date +'%Y/%m/%d %H:%M:%S'` - host $host is \033[0;31mdown\033[0m"
    else
         echo -e "`date +'%Y/%m/%d %H:%M:%S'` - host $host is \033[0;32mok\033[0m -`echo $result | cut -d ':' -f 2`"
        sleep 1 # avoid ping rain
    fi
done