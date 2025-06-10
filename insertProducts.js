import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Esquema del producto (igual que en server.js)
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Productos de ejemplo
const sampleProducts = [
    {
        name: "Whey Protein Premium",
        price: 49.99,
        description: "High-quality whey protein powder for muscle building and recovery",
        image: "https://cdn.pixabay.com/photo/2017/05/12/08/29/fitness-2306845_1280.jpg"
    },
    {
        name: "Creatine Monohydrate",
        price: 24.99,
        description: "Pure creatine monohydrate for enhanced strength and power",
        image: "https://cdn.pixabay.com/photo/2017/08/25/15/10/fitness-2680747_1280.jpg"
    },
    {
        name: "BCAA Energy Blend",
        price: 34.99,
        description: "Branched-chain amino acids with natural caffeine for workout energy",
        image: "https://cdn.pixabay.com/photo/2016/11/19/12/49/dumbbell-1839997_1280.jpg"
    },
    {
        name: "Pre-Workout Formula",
        price: 39.99,
        description: "Advanced pre-workout supplement for maximum performance",
        image: "https://cdn.pixabay.com/photo/2017/08/07/14/02/people-2604149_1280.jpg"
    }
];

async function insertProducts() {
    try {
        // Limpiar productos existentes (opcional)
        console.log('Clearing existing products...');
        await Product.deleteMany({});
        
        // Insertar nuevos productos
        console.log('Inserting sample products...');
        const insertedProducts = await Product.insertMany(sampleProducts);
        
        console.log(`Successfully inserted ${insertedProducts.length} products:`);
        insertedProducts.forEach(product => {
            console.log(`- ${product.name} (ID: ${product._id})`);
        });
        
        // Verificar que se insertaron correctamente
        const allProducts = await Product.find();
        console.log(`\nTotal products in database: ${allProducts.length}`);
        
    } catch (error) {
        console.error('Error inserting products:', error);
    } finally {
        mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

// Ejecutar el script
insertProducts();