# cp .env.staging .env
rm -rf .git .gitignore .eslintignore .eslintrc .circleci node_modules src typings test
rm .env.example .env.staging .editorconfig README.md

ssh root@3.15.214.83 "cd /home/CNPM && rimraf dist"

rsync -avzP . root@3.15.214.83:/home/CNPM

ssh root@3.15.214.83 "cd /home/CNPM && npm install && pm2 update && exit"

# ssh root@3.15.214.83 "cd /home/CNPM && git pull origin staging && npm install && npm run build && pm2 update && exit"