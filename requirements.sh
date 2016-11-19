#!bin/bash
# This script install the requeriments for firing up the program
# Using the distro debian

# 1. Node js 
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
