'use client';
import Layout from "../components/Layout";
import Cards from "./Cards";

export default function CardsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <Cards />
      </div>
    </Layout>
  );
}