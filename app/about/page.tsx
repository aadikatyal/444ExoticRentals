import { PageLayout } from "@/components/page-layout"

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-4">
            Welcome to 444 Exotic Rentals, your premier destination for luxury and exotic car rentals.
          </p>
          <p className="mb-4">
            Founded with a passion for exceptional automobiles, we provide car enthusiasts and discerning clients the
            opportunity to experience the thrill and prestige of driving the world's most coveted vehicles.
          </p>
          <p className="mb-4">
            Our fleet features an impressive collection of supercars, luxury sedans, and exotic sports cars from
            renowned manufacturers like Ferrari, Lamborghini, Porsche, Bentley, and more.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
          <p className="mb-4">
            Our mission is to deliver unforgettable driving experiences with impeccable service. We believe that
            everyone deserves to experience the extraordinary, even if just for a day.
          </p>
          <p className="mb-4">
            Whether you're celebrating a special occasion, impressing a client, or simply indulging your passion for
            fine automobiles, we provide the perfect vehicle paired with exceptional service.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Curated selection of premium and exotic vehicles</li>
            <li className="mb-2">Immaculate maintenance and preparation of every vehicle</li>
            <li className="mb-2">Flexible rental periods from single days to extended experiences</li>
            <li className="mb-2">Convenient delivery and pickup options</li>
            <li className="mb-2">Personalized service from our team of automotive enthusiasts</li>
            <li className="mb-2">Transparent pricing with no hidden fees</li>
          </ul>
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
          <p className="mb-4">
            Our team consists of passionate car enthusiasts who are dedicated to providing exceptional service. From our
            knowledgeable customer service representatives to our meticulous maintenance staff, everyone at 444 Exotic
            Rentals shares a commitment to excellence.
          </p>
          <p className="mb-8">
            We look forward to helping you create unforgettable memories behind the wheel of some of the world's most
            extraordinary automobiles.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}

