import { User } from '../../entity/user.entity';
import { Connection, getManager } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Category } from '../../entity/category.entity';
import * as jobsData from '../data/jobs.json';

import { JobType } from '../../common/enums/jobTypes.enum';
import { enumToArray } from '../../core/utils/helper';
import { Job } from '../../entity/job.entity';
import * as _ from 'lodash';
import slugify from 'slugify';
import axios from 'axios';
import { Address } from '../../entity/address.entity';

export default class JobsSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const authorRepository = connection.getRepository(User);
    const cateRepository = connection.getRepository(Category);
    const addressRepository = connection.getRepository(Address);
    const lowestSalary = [450, 500, 1000, 1500, 2000, 3000];
    const introImg = [
      'https://images.theconversation.com/files/344201/original/file-20200626-33533-13frdsm.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=675.0&fit=crop',
      'https://images.theconversation.com/files/349387/original/file-20200724-15-ldrybi.jpg?ixlib=rb-1.1.0&rect=23%2C535%2C5303%2C2651&q=45&auto=format&w=1356&h=668&fit=crop',
      'https://lh3.googleusercontent.com/proxy/AFVWGohbRgfgc-iDOMfsu2y3RP4qfZpwUgGuVvO_SPCNFz0Y_35xe90gPTJEsUeZTYRugWZlS3uIHTe2HdqNGBO-qQA_DLv3tnLDyBnKZN4DjHTGg4CdVbMysfa2C6SCXoKjgKGDP-XcV59nyg',
      'https://www.simplilearn.com/ice9/free_resources_article_thumb/The_Best_Interview_Questions_to_Ask_an_Employer.jpg',
      'https://images.globest.com/contrib/content/uploads/sites/304/2020/05/empty-office-resized.jpg',
      'https://www.jll.com.hk/images/global/jll-apac-here-is-how-office-life-for-now-has-changed-teaser.jpg',
      'https://www.taskforcehr.com/wp-content/uploads/2018/01/ffff.jpg',
      'https://previews.123rf.com/images/vadimgozhda/vadimgozhda1809/vadimgozhda180903392/108931887-work-bright-office-businesswoman-brainstorming-cooperation-group-young-designers-different-nationali.jpg',
      'https://c8.alamy.com/comp/RJ57MG/business-partners-are-discussing-a-plan-of-cooperation-in-the-workplace-in-the-office-RJ57MG.jpg',
      'https://www.policymed.com/wp-content/uploads/2019/05/Cooperation-Credit.jpg',
      'https://assets.entrepreneur.com/content/3x2/2000/20190206192329-GettyImages-1015140378.jpeg',
      'https://www.mtacorporate.com/wp-content/uploads/2019/07/1.jpg',
      'https://www.inquirer.com/resizer/46DZd5__L2hvdTWDFsivKpfaGCU=/0x68:1637x1157/1400x932/cloudfront-us-east-1.images.arcpublishing.com/pmn/HWHUC5ANWREUNOXLWR2FVONEYI.jpg',
    ];
    const highestSalary = [
      1000,
      1500,
      2300,
      2400,
      2500,
      2600,
      3000,
      4000,
      4200,
      4300,
      4400,
      5000,
    ];
    const author = await authorRepository.find({ where: { roleId: 4 } });
    const [cate, count] = await cateRepository.findAndCount();

    /**
     * Seed Job data by skill (Android)
     */
    for (let index = 0; index < jobsData.length; index++) {
      const numberOfCate = this.getRndInteger(3, 6);
      const date = new Date();
      const experienceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const jobTypeArray = enumToArray(JobType);

      const currentDate = date.getDate();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      const dueDate = this.getRndInteger(currentDate, 31);

      const provinces = await await axios.get(
        'https://vapi.vnappmob.com/api/province',
      );
      const splitAddress = _.split(jobsData[index].address, ',');

      const city = this.getSlug(_.last(splitAddress));
      const results = await axios.get(`${process.env.GEO_API_URL}`, {
        params: {
          address: jobsData[index].address,
          key: `${process.env.GEO_API_KEY}`,
        },
      });

      console.log('result', results);

      for (let track = 0; track < provinces.data.results.length; track++) {
        const splitProvince = _.split(
          this.getSlug(provinces.data.results[track].province_name),
          '-',
        );
        if (_.indexOf(splitProvince, 'pho') >= 0) {
          splitProvince.splice(0, 2);
        } else {
          splitProvince.splice(0, 1);
        }
        const joinProvince = splitProvince.join('-');

        if (joinProvince === city) {
          if (results.data.results.length >= 0) {
            await factory(Address)({
              payload: {
                city: provinces.data.results[track].province_id,
                description: jobsData[index].address,
                latitude: results.data.results[0].geometry.location.lat,
                longitude: results.data.results[0].geometry.location.lng,
              },
            }).create();
          } else {
            await factory(Address)({
              payload: {
                city: provinces.data.results[track].province_id,
                description: jobsData[index].address,
                latitude: null,
                longitude: null,
              },
            }).create();
          }
          break;
        }
      }

      const findAddress = await addressRepository.findOne({
        order: { createdat: 'DESC' },
      });
      const newJob = await factory(Job)({
        payload: {
          name: jobsData[index].name,
          content: jobsData[index].content,
          lowestWage:
            lowestSalary[Math.floor(Math.random() * lowestSalary.length)],
          highestWage:
            highestSalary[Math.floor(Math.random() * highestSalary.length)],
          description: jobsData[index].description[0],
          type:
            jobTypeArray[
              Math.floor(Math.floor(Math.random() * jobTypeArray.length))
            ],
          experience:
            experienceArray[
              Math.floor(Math.floor(Math.random() * experienceArray.length))
            ],
          deadline: new Date(`${currentYear}-${currentMonth}-${dueDate}`),
          user: author[Math.floor(Math.random() * author.length)],
          address: findAddress,
          status: true,
          introImg: introImg[Math.floor(Math.random() * introImg.length)],
        },
      }).create();

      const manager = await getManager();
      for (let index = 0; index < numberOfCate; index++) {
        const rndIndex = Math.floor(Math.random() * count);
        console.log('random', rndIndex);

        const findJobCate = await manager.query(
          `SELECT * FROM "Job_Cate" WHERE "jobId"='${newJob.id}' AND "cateId"='${cate[rndIndex].id}'`,
        );

        if (findJobCate.length === 0) {
          await manager.query(
            `INSERT INTO "Job_Cate" values('${newJob.id}', ${cate[rndIndex].id})`,
          );
        }
      }
    }
  }
  getRndInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  getSlug(slug: string) {
    return slugify(slug, {
      replacement: '-', // replace spaces with replacement character, defaults to `-`
      remove: undefined, // remove characters that match regex, defaults to `undefined`
      lower: true, // convert to lower case, defaults to `false`
      strict: false, // strip special characters except replacement, defaults to `false`
      locale: 'vi',
    });
  }
}
