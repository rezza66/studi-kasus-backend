import fs from 'fs';
import path from 'path';
import Product from '../models/productModel.js';


export const getProducts = async(req, res, next) => {
    try {
        const { category, tags, name } = req.query;
        
        let filter = {};
        if (category) filter.category = category;
        if (tags) filter.tags = { $in: tags.split(',') };
        if (name) filter.name = { $regex: name, $options: 'i' };

        const products = await Product.find(filter).populate('category').populate('tags');
        
        const count = await Product.countDocuments(filter);
        
        res.status(200).json({ products, count });
    } catch (error) {
        next(error);
    }
}

export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category').populate('tags');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

export async function createProduct(req, res, next) {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            image: req.file ? req.file.path : '',
            category: req.body.category,
            tags: req.body.tags
        });
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        next(error);
    }
}

export async function updateProduct(req, res, next) {
    try {
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            image: req.file ? req.file.path : req.body.image,
            category: req.body.category,
            tags: req.body.tags
        };

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, productData, { new: true }).populate('category').populate('tags');

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (req.file && req.body.old_image) {
            const filePath = path.join(process.cwd(), 'uploads', req.body.old_image);
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted old image: ${filePath}`);
            } catch (err) {
                console.error(`Error deleting old image: ${err}`);
            }
        }

        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
}

export async function deleteProduct(req, res, next) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.image) {
            const filePath = path.join(process.cwd(), product.image);
            try {
                fs.unlinkSync(filePath);
                console.log(`Deleted product image: ${filePath}`);
            } catch (err) {
                console.error(`Error deleting product image: ${err}`);
            }
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
}
