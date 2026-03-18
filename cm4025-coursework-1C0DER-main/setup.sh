# Update your package list
sudo apt update

# Install Git
sudo apt install git

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Create the 'microfiction' directory
mkdir microfiction
cd microfiction

git clone https://github.com/RobertGordonUniversity/cm4025-coursework-1C0DER.git
cd cm4025-coursework-1C0DER

# Install npm dependencies in the repo directory
npm install

# Install required dependencies for the project
npm install dotenv cors path express mongodb jsonwebtoken express-rate-limit bcrypt

# Allow port 8080 through firewall for remote access
sudo ufw enable
sudo ufw allow 8080

# Start MongoDB installation (if it's not installed already)
sudo apt-get update
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Reload it first
systemctl daemon-reload

# Download the .deb file for MongoDB Shell
wget https://downloads.mongodb.com/compass/mongodb-mongosh_2.5.0_amd64.deb

# Install the MongoDB Shell
sudo dpkg -i mongodb-mongosh_2.5.0_amd64.deb

# Start MongoDB service and open a seperate terminal for it
mongod --dbpath ~/microfiction/cm4025-coursework-1C0DER/StryDB & gnome-terminal &

# Start your server
node index.js