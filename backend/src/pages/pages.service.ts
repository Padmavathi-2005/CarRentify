import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, PageDocument } from './schemas/page.schema';

@Injectable()
export class PagesService {
  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async onModuleInit() {
    const count = await this.pageModel.countDocuments();
    if (count === 0) {
      const defaultPages = [
        {
          title: 'Help Center',
          slug: 'help-center',
          content: '<h1>Help Center</h1><p>Welcome to our help center. Find all the support you need for your luxury drive journey.</p>',
          status: 'Published',
          order: 1,
          translations: {
            fr: { title: 'Centre d\'aide', content: '<h1>Centre d\'aide</h1><p>Bienvenue dans notre centre d\'aide. Trouvez tout le soutien dont vous avez besoin.</p>' },
            ta: { title: 'உதவி மையம்', content: '<h1>உதவி மையம்</h1><p>எங்கள் உதவி மையத்திற்கு வரவேற்கிறோம். உங்களுக்கு தேவையான அனைத்து ஆதரவையும் இங்கே காணலாம்.</p>' }
          }
        },
        {
          title: 'FAQ',
          slug: 'faq',
          content: '<h1>Frequently Asked Questions</h1><p>Quick answers to common questions about booking, safety, and payments.</p>',
          status: 'Published',
          order: 2,
          translations: {
            fr: { title: 'FAQ', content: '<h1>Questions Fréquentes</h1><p>Réponses rapides aux questions courantes sur la réservation et la sécurité.</p>' },
            ta: { title: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', content: '<h1>அடிக்கடி கேட்கப்படும் கேள்விகள்</h1><p>பதிவு, பாதுகாப்பு மற்றும் கொடுப்பனவுகள் பற்றிய பொதுவான கேள்விகளுக்கான பதில்கள்.</p>' }
          }
        },
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          content: '<h1>Terms of Service</h1><p>Our commitment to excellence and your responsibilities as a premium driver.</p>',
          status: 'Published',
          order: 3,
          translations: {
            fr: { title: 'Conditions d\'utilisation', content: '<h1>Conditions d\'utilisation</h1><p>Notre engagement envers l\'excellence et vos responsabilités.</p>' },
            ta: { title: 'சேவை விதிமுறைகள்', content: '<h1>சேவை விதிமுறைகள்</h1><p>சிறப்புக்கான எங்கள் அர்ப்பணிப்பு மற்றும் உங்கள் பொறுப்புகள்.</p>' }
          }
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: '<h1>Privacy Policy</h1><p>We treat your data with the same luxury standard we treat our cars. Total security.</p>',
          status: 'Published',
          order: 4,
          translations: {
            fr: { title: 'Politique de confidentialité', content: '<h1>Politique de confidentialité</h1><p>Nous traitons vos données avec la même norme de luxe que nos voitures.</p>' },
            ta: { title: 'தனியுரிமைக் கொள்கை', content: '<h1>தனியுரிமைக் கொள்கை</h1><p>உங்கள் தரவை நாங்கள் பாதுகாப்பாக கையாளுகிறோம்.</p>' }
          }
        },
        {
          title: 'Security',
          slug: 'security',
          content: '<h1>Security Standards</h1><p>Our platform uses bank-grade encryption and advanced security protocols to protect every transaction.</p>',
          status: 'Published',
          order: 5,
          translations: {
            fr: { title: 'Sécurité', content: '<h1>Normes de Sécurité</h1><p>Notre plateforme utilise un cryptage de niveau bancaire.</p>' },
            ta: { title: 'பாதுகாப்பு', content: '<h1>பாதுகாப்பு தரநிலைகள்</h1><p>எங்கள் தளம் வங்கி தர குறியாக்கத்தைப் பயன்படுத்துகிறது.</p>' }
          }
        },
        {
          title: 'System Status',
          slug: 'status',
          content: '<h1>System Status</h1><p>All CarRentify systems are currently operational and performing at peak efficiency.</p>',
          status: 'Published',
          order: 6,
          translations: {
            fr: { title: 'État du système', content: '<h1>État du système</h1><p>Tous les systèmes de CarRentify sont opérationnels.</p>' },
            ta: { title: 'கணினி நிலை', content: '<h1>கணினி நிலை</h1><p>அனைத்து CarRentify அமைப்புகளும் தற்போது சிறப்பாக செயல்படுகின்றன.</p>' }
          }
        }
      ];
      await this.pageModel.insertMany(defaultPages);
      console.log('Professional static pages seeded successfully');
    }
  }

  async create(createPageDto: any): Promise<Page> {
    const createdPage = new this.pageModel(createPageDto);
    return createdPage.save();
  }

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().sort({ order: 1, createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageModel.findById(id).exec();
    if (!page) throw new NotFoundException(`Page #${id} not found`);
    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageModel.findOne({ slug }).exec();
    if (!page) throw new NotFoundException(`Slug /${slug} not found`);
    return page;
  }

  async update(id: string, updatePageDto: any): Promise<Page> {
    const updatedPage = await this.pageModel
      .findByIdAndUpdate(id, updatePageDto, { new: true })
      .exec();
    if (!updatedPage) throw new NotFoundException(`Page #${id} not found`);
    return updatedPage;
  }

  async remove(id: string): Promise<any> {
    const deletedPage = await this.pageModel.findByIdAndDelete(id).exec();
    if (!deletedPage) throw new NotFoundException(`Page #${id} not found`);
    return { id, deleted: true };
  }
}
