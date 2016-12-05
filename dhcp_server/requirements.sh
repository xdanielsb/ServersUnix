1.0
    yum update
2.0
    yum install dhcp
3.0 
     sudo vim /etc/sysconfig/network-scripts/ifcfg-eth0
     DEVICE="eth0"
     HWADDR="00:0C:29:F1:01:4B"
     NM_CONTROLLED="yes"
     ONBOOT="yes"
     BOOTPROTO="none"
     IPADDR=192.168.1.11
     NETMASK=255.255.255.0
     GATEWAY=192.168.1.1
4.0 
    sudo vim  /etc/sysconfig/dhcpd
    # Command line options here
    DHCPDARGS=eth0
5.0
     sudo vim /etc/dhcp/dhcpd.conf
     option domain-name "krizna.com";
     #specify DNS server ip and additional DNS server ip
     option domain-name-servers 192.168.1.10, 208.67.222.222;
     #specify default lease time
     default-lease-time 600;
     #specify Max lease time
     max-lease-time 7200;
     #specify log method
     log-facility local7;
     #Configuring subnet and iprange
     subnet 192.168.1.0 netmask 255.255.255.0 {
     range 192.168.1.50 192.168.1.254;
     option broadcast-address 192.168.1.255;
     #Default gateway ip
     option routers 192.168.1.1;
    }
     #Fixed ip address based on MAC id
    host Printer01 {
    hardware ethernet 02:34:37:24:c0:a5;
    fixed-address 192.168.1.55;
    }

6.0 Start the service
    service dhcpd start
7.0
    chkconfig --levels 235 dhcpd domain
