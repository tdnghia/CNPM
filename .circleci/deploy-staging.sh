# cp .env.staging .env
rm -rf .git .gitignore .eslintignore .eslintrc .circleci node_modules src test
rm .env.example README.md

ssh root@18.219.72.101 "cd /home/CNPM && rimraf dist"

rsync -avzP . root@18.219.72.101:/home/CNPM

ssh root@18.219.72.101 "cd /home/CNPM && npm install && pm2 update && exit"

#config
# ssh root@18.219.72.101 "cd /home/CNPM && git pull origin master && npm install && npm run build && pm2 update && exit"