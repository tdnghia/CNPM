import { User } from '../../entity/user.entity';
import { Connection, getManager } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Category } from '../../entity/category.entity';
import * as jobsByAndroid from '../data/jobs.json';
import { Experience } from '../../common/enums/experience.enum';
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

    const lowestSalary = [
      300,
      350,
      365,
      400,
      465,
      450,
      500,
      565,
      550,
      555,
      600,
      655,
      650,
      700,
      755,
      750,
    ];
    const highestSalary = [
      1000,
      1200,
      1400,
      1600,
      1800,
      2000,
      2200,
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
    console.log('author', author);

    const date = new Date();
    const experienceArray = enumToArray(Experience);
    const jobTypeArray = enumToArray(JobType);

    const androidCate = await cateRepository.findOne({
      where: { name: 'Android' },
    });

    /**
     * Seed Job data by skill (Android)
     */
    for (let index = 0; index < jobsByAndroid.length; index++) {
      const currentDate = date.getDate();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      const dueDate = this.getRndInteger(currentDate, 31);
      const numberOfTag = this.getRndInteger(1, 4);

      const provinces = await await axios.get(
        'https://vapi.vnappmob.com/api/province',
      );
      const splitAddress = _.split(jobsByAndroid[index].address, ',');

      const city = this.getSlug(_.last(splitAddress));

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
          await factory(Address)({
            payload: {
              city: provinces.data.results[track].province_id,
              description: jobsByAndroid[index].address,
            },
          }).create();
          break;
        }
      }
      
      const findAddress = await addressRepository.findOne({
        order: { createdat: 'DESC' },
      });
      const newJob = await factory(Job)({
        payload: {
          name: jobsByAndroid[index].name,
          content: jobsByAndroid[index].content,
          lowestWage:
            lowestSalary[Math.floor(Math.random() * lowestSalary.length)],
          highestWage:
            highestSalary[Math.floor(Math.random() * highestSalary.length)],
          description: jobsByAndroid[index].description[0],
          type: jobTypeArray[Math.floor(Math.floor(Math.random() * 2))],
          experience:
            experienceArray[
              Math.floor(Math.floor(Math.random() * experienceArray.length))
            ],
          deadline: new Date(`${currentYear}-${currentMonth}-${dueDate}`),
          user: author[Math.floor(Math.random() * author.length)],
          category: androidCate,
          address: findAddress,
        },
      }).create();

      const manager = await getManager();
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
