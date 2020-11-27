import { Skill } from '../../entity/skill.entity';
import { Connection } from 'typeorm';
import { Seeder, Factory } from 'typeorm-seeding';

export default class SkillsSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const skillRepository = connection.getRepository(Skill);

    const skill = [
      {
        name: 'ios',
        icon:
          'https://drive.google.com/uc?id=16z4RKVJqta6fqhC3vPfWAIpGaHiDpvMF',
      },
      {
        name: 'Android',
        icon:
          'https://drive.google.com/uc?id=1Xo58ryFmVJtS-bICOBIcBRwYNnWHKjOu',
      },
      {
        name: 'Backend',
        icon:
          'https://drive.google.com/uc?id=1niC4jjLXgSbiDKP-DYy9BkeoPqXVPNUB',
      },
      {
        name: 'Java',
        icon:
          'https://drive.google.com/uc?id=1cgKGPMaQxPUtvPVLAvzWctLhypBxXU--',
      },
      {
        name: 'C/C++',
        icon:
          'https://drive.google.com/uc?id=1inOwrijJXdENyX9NOtVoR3-kVZBEwkXp',
      },
      {
        name: 'ASP.NET',
        icon:
          'https://drive.google.com/uc?id=1_kgx-SUcC0eviJ04UytxI2qNvsy-hd26',
      },
      {
        name: '.NET/C#',
        icon:
          'https://drive.google.com/uc?id=1_kgx-SUcC0eviJ04UytxI2qNvsy-hd26',
      },
      {
        name: 'NodeJS',
        icon:
          'https://drive.google.com/uc?id=1RF-BcvzPE5Ba-gWGFHvrxc2rER7BgpmN',
      },
      {
        name: 'PHP',
        icon:
          'https://drive.google.com/uc?id=1L_UUqPKxe1mV5IIs0rPRZGzRNkfDirKW',
      },
      {
        name: 'Python',
        icon:
          'https://drive.google.com/uc?id=1ZQBaTJKesm7SFaxWVIA33-07dLjKJh3n',
      },
      {
        name: 'Ruby',
        icon:
          'https://drive.google.com/uc?id=13GvjGCd4VKQkdAqF6I_toqKh1mS1lchH',
      },
      {
        name: 'Javascript',
        icon:
          'https://drive.google.com/uc?id=1XIUQwO2pdvwJtPyC2-mjXhyOM-EZnIoF',
      },
      {
        name: 'Frontend',
        icon:
          'https://drive.google.com/uc?id=1XIUQwO2pdvwJtPyC2-mjXhyOM-EZnIoF',
      },
      {
        name: 'Quản Lý Sản Phẩm',
        icon:
          'https://drive.google.com/uc?id=1oBJXV31kPE-3k8amOE6V_saM67O7afiI',
      },
      {
        name: 'SQL',
        icon:
          'https://drive.google.com/uc?id=1ikyOURVqKsAStg2Udf9J4i7NDQPdwozL',
      },
      {
        name: 'SQL',
        icon:
          'https://drive.google.com/uc?id=1ikyOURVqKsAStg2Udf9J4i7NDQPdwozL',
      },
      {
        name: 'Quản Lý Dự án (IT)',
        icon:
          'https://drive.google.com/uc?id=1QJVVfjJB5fdPysPl1JKJawTXDG9cEsPB',
      },
      {
        name: 'Data Analytics',
        icon:
          'https://drive.google.com/uc?id=17ma6yp46HpGiKanjoZp2k1gPRVZkwmlp',
      },
      {
        name: 'Cloud (AWS/Azure)',
        icon:
          'https://drive.google.com/uc?id=1AVcLDGQLdyI9Fe98Di76TaoRV9KyLOFw',
      },
    ];
    for (let i = 0; i < skill.length; i++) {
      const newSkill = await skillRepository.create({
        name: skill[i].name,
        icon: skill[i].icon,
      });
      await skillRepository.save(newSkill);
    }
  }
}
