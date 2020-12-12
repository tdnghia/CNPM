import { EducationsEntity } from "../../entity/education.entity";
import { Connection } from "typeorm";
import { Seeder, Factory } from "typeorm-seeding";

export default class EducationsSeeder implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        const educationRepository = connection.getRepository(EducationsEntity);

        const nameArr = [
            "Trường Đại Học Bách Khoa Đà Nẵng",
            "Trường Đại Học FPT",
            "Trường Đại Học Duy Tân",
            "Trường Đại Học Sư Phạm Đà Nẵng",
            "Trường Đại Học Bách Khoa Hồ Chí Minh",
            "Trường Đại Học Bách Khoa Hà Nội",
        ];

        const majorArr = [
            "Công nghệ thông tin",
            "Khoa học máy tính",
            "Kỹ thuật phần mềm",
            "Hệ thống thông tin",
            "Mạng máy tính",
        ];

        for (let i = 0; i < 10; i++) {
            const newEducation =await educationRepository.create({
                name: nameArr[Math.floor(Math.random() * nameArr.length)],
                    major: majorArr[Math.floor(Math.random() * majorArr.length)],
                    description: '',
                    certification: '',
            })
            await educationRepository.save(newEducation);
        }
    }
}