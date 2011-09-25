#!/bin/bash

appname="$1"
port="$2"

if [ -z "$appname" ]
then
    echo "Missing application name!"
    echo ""
    echo "Correct usage:"
    echo "  sudo $0 app_name port"    
    echo "For Example:"
    echo "  sudo $0 my_magic_app 3000"    
    exit 1
fi

if [ -z "$port" ]
then
    echo "Missing port!"
    echo ""
    echo "Correct usage:"
    echo "  sudo $0 app_name port"    
    echo "For Example:"
    echo "  sudo $0 my_magic_app 3000"    
    exit 1
fi

username=`ls -al | head -n 2 | tail -n "1" | tr -s " " | cut -f "3" -d " "`
group=`ls -al | head -n 2 | tail -n "1" | tr -s " " | cut -f "4" -d " "`

echo "Configuring for:"
echo "  application_name: $appname"
echo "  port: $port"
echo "  username: $username"
echo "  group: $group"

upstartconf_name="/etc/init/$appname.conf"
monitrc_name="/etc/monit/conf.d/$appname.monitrc"
logfile_name="`pwd`/node.log"

echo "Will generate:"
echo "  $monitrc_name"
echo "  $upstartconf_name"
echo "The daemons output will be stored at:"
echo "  $logfile_name"

echo "Press enter to continue ... (stop with CTRL+C)"
read

echo -n "" > $monitrc_name
echo "check process $appname" >> $monitrc_name
echo "    with pidfile \"/var/run/$appname.pid\"" >> $monitrc_name
echo "    start program = \"/sbin/start $appname\"" >> $monitrc_name
echo "    stop program = \"/sbin/stop $appname\"" >> $monitrc_name
echo "    if 2 restarts within 3 cycles then timeout" >> $monitrc_name
echo "    if totalmem > 100 Mb then alert" >> $monitrc_name
echo "    if children > 255 for 5 cycles then stop" >> $monitrc_name
echo "    if cpu usage > 95% for 3 cycles then restart" >> $monitrc_name
echo "    if failed port $port protocol http" >> $monitrc_name
echo "        request /" >> $monitrc_name
echo "        with timeout 5 seconds" >> $monitrc_name
echo "      then restart" >> $monitrc_name

echo "#!upstart" > $upstartconf_name
echo "description \"$appname nodejs server\"" >> $upstartconf_name
echo "author \"spludo generator\"" >> $upstartconf_name
echo "" > $upstartconf_name
echo "start on (local-filesystems and net-device-up IFACE=eth0)" >> $upstartconf_name
echo "stop on runlevel 0" >> $upstartconf_name
echo "" > $upstartconf_name
echo "respawn # restart when job dies" >> $upstartconf_name
echo "respawn limit 5 60 # give up restart after 5 respawns in 60 seconds" >> $upstartconf_name
echo "" > $upstartconf_name
echo "script " >> $upstartconf_name
echo "    exec start-stop-daemon --start --make-pidfile --pidfile /var/run/$appname.pid --chdir `pwd` --chuid $username:$group --exec  /usr/local/bin/node run_server.js 2>&1 >> \"$logfile_name\"" >> $upstartconf_name
echo "end script" >> $upstartconf_name

echo "Finished. Please restart monit with /etc/init.d/monit restart"
