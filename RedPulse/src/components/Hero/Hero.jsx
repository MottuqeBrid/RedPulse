import { Link } from "react-router";

const Hero = () => {
  return (
    <div className="hero min-h-[calc(100vh-4rem)]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold">
            Every Drop <span className="text-primary">Saves</span> a Life
          </h1>
          <p className="py-6 text-lg text-base-content/70">
            Join thousands of heroes who donate blood every day. One donation can
            save up to three lives. Be the pulse that keeps hearts beating.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/services" className="btn btn-primary btn-lg">
              Donate Now
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
