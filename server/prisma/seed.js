import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma=new PrismaClient();
const products=[
['aurelia','The Aurelia','the-aurelia','Automatic','42mm',1250,'women','NOVIS','A refined expression of modern design.',['Swiss Automatic Movement','Sapphire Crystal','316L Stainless Steel','Water Resistant (5ATM)'],'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',24],
['valor','The Valor','the-valor','Automatic','41mm',990,'men','NOVIS','A disciplined everyday companion shaped by balanced proportions.',['Swiss Automatic Movement','Domed Sapphire Crystal','316L Stainless Steel','Water Resistant (5ATM)'],'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=85',30],
['orion','The Orion','the-orion','Chronograph','44mm',1420,'men','NOVIS','A bold chronograph with a measured profile.',['Swiss Chronograph','Sapphire Crystal','316L Stainless Steel','Water Resistant (10ATM)'],'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=85',18],
['solstice','The Solstice','the-solstice','Automatic','40mm',1180,'women','NOVIS','Warm, understated and precise.',['Swiss Automatic Movement','Sapphire Crystal','Premium Leather','Water Resistant (5ATM)'],'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=85',21],
['vertex','The Vertex','the-vertex','Automatic','39mm',990,'limited','NOVIS','A compact architectural silhouette with a clean dial.',['Swiss Automatic Movement','Sapphire Crystal','Ceramic Bezel','Water Resistant (5ATM)'],'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=85',12],
['equinox','The Equinox','the-equinox','Chronograph','42mm',1560,'men','NOVIS','Precision chronograph engineering with restrained proportions.',['Swiss Chronograph','Sapphire Crystal','316L Stainless Steel','Water Resistant (10ATM)'],'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=85',16]
];
async function main(){
 const h=await bcrypt.hash('muttahir123@',12);
 await prisma.user.upsert({where:{email:'admin@novis.local'},update:{name:'Muttahir',passwordHash:h,role:'ADMIN'},create:{name:'Muttahir',email:'admin@novis.local',passwordHash:h,role:'ADMIN'}});
 for(const [id,name,slug,type,size,price,category,brand,description,features,image,stock] of products){await prisma.product.upsert({where:{id},update:{name,slug,type,size,price,category,brand,description,features,images:[image],stock},create:{id,name,slug,type,size,price,category,brand,description,features,images:[image],stock}})}
 console.log('Seed complete. Admin: admin@novis.local / muttahir123@');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
