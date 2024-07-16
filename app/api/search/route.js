import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export async function GET(request) {
  const query = request.nextUrl.searchParams.get("query")

  try {
    const client = await clientPromise;
    const database = client.db('stock');
    const inventory = database.collection('inventory');
 
    const products = await inventory.aggregate([{
        $match: {
          $or: [
            { slug: { $regex: query, $options: "i" } },
          ]
        }
      }
    ]).toArray()
    
    return NextResponse.json({ success: true, products})
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}