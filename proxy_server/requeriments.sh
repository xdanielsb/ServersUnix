#!bin/bash
# Install the following requeriments


# sometimes the package is squid instead of squid
# Just changes some additional feauters but the 
# other thing are the same.


sudo apt-get install squid3

#optional, check the status squid
sudo service squid3 status

#start the service 
sudo service squid3 start 
