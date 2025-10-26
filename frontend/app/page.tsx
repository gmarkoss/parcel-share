import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
          Welcome to ParcelShare
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          Connect people who want to send small parcels with travelers already heading that way.
          Save money, reduce carbon footprint, and help your community.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-base md:text-lg font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/search"
            className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-base md:text-lg font-medium"
          >
            Browse Trips
          </Link>
        </div>
      </div>

      <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Send Parcels</h3>
          <p className="text-sm md:text-base text-gray-600">
            Need to send a small parcel? Find travelers heading your way and get it delivered affordably.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold mb-2">Offer Trips</h3>
          <p className="text-sm md:text-base text-gray-600">
            Already traveling? Earn extra income by carrying small parcels on your journey.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Build Community</h3>
          <p className="text-sm md:text-base text-gray-600">
            Join a trusted network of people helping each other while reducing environmental impact.
          </p>
        </div>
      </div>

      <div className="mt-12 md:mt-16 bg-blue-50 p-6 md:p-8 rounded-lg mx-4 md:mx-0">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="font-semibold mb-2">Post or Find</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Post a parcel request or offer a trip with your route and schedule
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="font-semibold mb-2">Match & Connect</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Our system matches parcels with compatible trips automatically
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="font-semibold mb-2">Deliver & Earn</h4>
            <p className="text-xs md:text-sm text-gray-600">
              Complete the delivery and get rewarded. Track everything in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
