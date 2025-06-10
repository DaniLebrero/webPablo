import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS más específica
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Definir el esquema del producto - CORREGIDO
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
    timestamps: true // Añade createdAt y updatedAt automáticamente
});

const Product = mongoose.model('Product', productSchema);

// Rutas para los productos
app.get('/api/products', async (req, res) => {
    try {
        console.log('=== API PRODUCTS REQUEST ===');
        console.log('Request from:', req.headers.origin);
        console.log('Fetching products...');
        
        const products = await Product.find();
        console.log(`Found ${products.length} products from database`);
        
        // Transformar los productos para el frontend
        const transformedProducts = products.map(product => ({
            id: product._id.toString(), // Usar _id de MongoDB como id
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image
        }));
        
        console.log('Transformed products:', transformedProducts);
        console.log('Sending response...');
        
        // Agregar headers CORS explícitamente
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        res.json(transformedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        console.log('Creating product:', req.body); // Para debugging
        
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            image: req.body.image,
        });

        const newProduct = await product.save();
        console.log('Product created:', newProduct); // Para debugging
        
        // Transformar la respuesta
        const transformedProduct = {
            id: newProduct._id.toString(),
            name: newProduct.name,
            price: newProduct.price,
            description: newProduct.description,
            image: newProduct.image
        };
        
        res.status(201).json(transformedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Ruta para debugging - ver todos los datos raw
app.get('/api/products/debug', async (req, res) => {
    try {
        const products = await Product.find();
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        res.json({
            products: products,
            collections: collections.map(c => c.name),
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});