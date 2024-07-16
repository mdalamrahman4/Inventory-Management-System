import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function GET(request) {
  try {
    const client = await clientPromise;
    const database = client.db('stock');
    const inventory = database.collection('inventory');
    const query = {};
    const products = await inventory.find(query).toArray();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const database = client.db('stock');
    const inventory = database.collection('inventory');
    const result = await inventory.insertOne(body);
    const insertedProduct = { ...body, _id: result.insertedId };
    return NextResponse.json({ success: true, product: insertedProduct });
  } catch (error) {
    console.error("Failed to insert product:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}