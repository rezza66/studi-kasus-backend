import express from 'express';
import {
    getCartItems,
    updateCarts
} from '../controller/cartController.js';

const router = express.Router();

router.get('/carts', getCartItems);
router.put('/cart', updateCarts);

export default router;
