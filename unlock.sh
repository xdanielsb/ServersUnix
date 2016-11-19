#!bin/bash
# This script  helps to unlock the package manager in some 
# cases when the are resctrictions to install a program 

sudo rm /var/lib/apt/lists/lock
sudo rm /var/cache/apt/archives/lock
sudo rm /var/lib/dpkg/lock
