import { Skill } from "../../entity/skill.entity";
import { Connection } from "typeorm";
import { Seeder, Factory } from "typeorm-seeding";

export default class SkillsSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const skillRepository = connection.getRepository(Skill);

        const skill = [
            '.NET/C#',
            'PHP',
            'Full-Stack',
            'Java',
            'NodeJS'
        ]

        for (let i = 0; i < skill.length; i++) {
            const newSkill = await skillRepository.create({name: skill[i]});
            await skillRepository.save(newSkill);
        }
    }
}