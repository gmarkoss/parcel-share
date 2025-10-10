import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to ParcelShare
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect people who want to send small parcels with travelers already heading that way.
          Save money, reduce carbon footprint, and help your community.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/search"
            className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium"
          >
            Browse Trips
          </Link>
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Send Parcels</h3>
          <p className="text-gray-600">
            Need to send a small parcel? Find travelers heading your way and get it delivered affordably.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold mb-2">Offer Trips</h3>
          <p className="text-gray-600">
            Already traveling? Earn extra income by carrying small parcels on your journey.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Build Community</h3>
          <p className="text-gray-600">
            Join a trusted network of people helping each other while reducing environmental impact.
          </p>
        </div>
      </div>

      <div className="mt-16 bg-blue-50 p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-semibold mb-2">Post or Find</h4>
            <p className="text-sm text-gray-600">
              Post a parcel request or offer a trip with your route and schedule
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-semibold mb-2">Match & Connect</h4>
            <p className="text-sm text-gray-600">
              Our system matches parcels with compatible trips automatically
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-semibold mb-2">Deliver & Earn</h4>
            <p className="text-sm text-gray-600">
              Complete the delivery and get rewarded. Track everything in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
