import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function HomePage({ onNavigate }) {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const petsRes = await api.getPublicCatalog({ limit: 4 });
        if (petsRes.success) setFeaturedPets(petsRes.data.slice(0, 4));

        // Attempt rescue fetch if available
        api.getRescues().then(rRes => {
          if (rRes.success) setRescues(rRes.data.slice(0, 3));
        }).catch(() => {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { label: 'Dogs', type: 'Dog', icon: '🐕', count: 'High Availability' },
    { label: 'Cats', type: 'Cat', icon: '🐈', count: 'Ready for Homes' },
    { label: 'Birds', type: 'Bird', icon: '🦜', count: 'Singing Companions' },
    { label: 'Rabbits', type: 'Rabbit', icon: '🐇', count: 'Gentle Friends' },
    { label: 'Small Pets', type: 'Hamster', icon: '🐹', count: 'Pocket Pets' },
    { label: 'Aquatics & Turtles', type: 'Turtle', icon: '🐢', count: 'Specialized Care' }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-700/80 border border-teal-500/50 text-teal-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <span>✨ No-Kill Animal Shelter & Sanctuary</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Every Pet Deserves a <span className="text-orange-400 underline decoration-wavy decoration-orange-500/60">Loving Home</span>
          </h1>

          <p className="text-lg sm:text-xl text-teal-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect with rescued dogs, cats, birds, and small animals waiting for a second chance. 
            All shelter pets are vaccinated, medically vetted, and socialized.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('public-pets')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>🐾 Find a Pet to Adopt</span>
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 backdrop-blur-sm transition-all text-center"
            >
              How Adoption Works
            </a>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-teal-700/50 max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-extrabold text-orange-400">1,250+</p>
              <p className="text-xs text-teal-200 font-medium mt-1">Animals Rescued</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-orange-400">980+</p>
              <p className="text-xs text-teal-200 font-medium mt-1">Happy Adoptions</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-orange-400">100%</p>
              <p className="text-xs text-teal-200 font-medium mt-1">Vaccinated & Microchipped</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-orange-400">24/7</p>
              <p className="text-xs text-teal-200 font-medium mt-1">Emergency Medical Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PET CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore By Category</h2>
          <p className="text-base text-slate-500 mt-2">Find your ideal match among our shelter residents</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('public-pets', cat.type)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all text-center cursor-pointer transform hover:-translate-y-1"
            >
              <span className="text-4xl block mb-2">{cat.icon}</span>
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-teal-700">{cat.label}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. AVAILABLE PETS FEATURED GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pets Waiting For You</h2>
            <p className="text-base text-slate-500 mt-1">Ready for immediate loving adoption</p>
          </div>
          <button
            onClick={() => onNavigate('public-pets')}
            className="text-sm font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
          >
            <span>View All Available Pets</span>
            <span>&rarr;</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading companion pets...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPets.map(pet => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={pet.primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={pet.adoption_status} />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold">
                    {pet.pet_code}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-900">{pet.name}</h3>
                      <span className="text-xs font-semibold text-slate-500">{pet.gender}</span>
                    </div>
                    <p className="text-sm font-medium text-teal-700">{pet.breed} &bull; {pet.animal_type}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{pet.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">📍 {pet.current_location}</span>
                    <button
                      onClick={() => onNavigate('public-pet-detail', pet.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white font-bold text-xs transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENT RESCUES SECTION */}
      {rescues.length > 0 && (
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
                Emergency Response
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Recently Rescued Animals</h2>
              <p className="text-sm text-slate-500 mt-1">Cases brought in by our 24/7 rescue division</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rescues.map(rescue => (
                <div key={rescue.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="text-rose-600 font-extrabold">🚨 {rescue.rescue_code}</span>
                    <span>Date: {rescue.rescue_date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{rescue.pet_type} Rescued at {rescue.rescue_location}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Initial State:</strong> {rescue.initial_condition}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Rescued by:</strong> {rescue.rescued_by} &bull; <strong>Current Location:</strong> {rescue.current_location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. HOW ADOPTION WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our 4-Step Adoption Process</h2>
          <p className="text-base text-slate-500 mt-2">Ethical, transparent, and designed for animal welfare</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Search & Select</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explore our live catalog, filter by animal species, temperament, and requirements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Submit Application</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Fill out the digital application describing your household, experience, and living environment.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Shelter Meet & Greet</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Visit our sanctuary to interact with the pet in person and ensure personality compatibility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 font-black text-xl flex items-center justify-center mx-auto">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Welcome Home</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sign the guardianship agreement, receive medical records, adoption certificate, and take your pet home!
            </p>
          </div>
        </div>
      </section>

      {/* 6. SUCCESS STORIES */}
      <section className="bg-teal-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 shadow-2xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-orange-400 font-extrabold text-sm uppercase tracking-wider">&hearts; Success Stories</span>
          <h2 className="text-3xl sm:text-4xl font-black">"Charlie Found His Dream Family"</h2>
          <p className="text-teal-100 text-base leading-relaxed italic">
            "We adopted Charlie the Beagle through Paws & Care in February 2026. The staff provided his complete
            vaccination history and helped us through the home visit seamlessly. Charlie is now the happiest member of our family!"
          </p>
          <div className="pt-2 font-bold text-sm text-orange-300">
            &mdash; The Kulkarni Family (Adopted Charlie, PET-2026-00005)
          </div>
        </div>
      </section>

      {/* 7. CONTACT US & ABOUT US */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-6">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">About Our Sanctuary</span>
            <h3 className="text-3xl font-extrabold text-slate-900">Dedicated to Humane Rescue & No-Kill Advocacy</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded in Pune in 2018, Paws & Care Sanctuary provides round-the-clock ambulance rescue,
              clinical orthopedic surgeries, emergency rehabilitation, and foster support. Every resident receives
              tailored nutrition and regular veterinary oversight.
            </p>
            <div className="space-y-3 pt-2 text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <span className="text-teal-700 font-bold">📍</span>
                <span>Plot 45, Green Valley Sanctuary Road, Near Pashan Lake, Pune, Maharashtra 411021</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-teal-700 font-bold">📞</span>
                <span>Rescue Hotline: +91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-teal-700 font-bold">✉️</span>
                <span>contact@pawsandcare.org</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-lg">Leave a Message</h4>
            <p className="text-xs text-slate-500">Have questions regarding pet adoption or volunteer programs?</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              />
              <textarea
                rows={3}
                placeholder="How can we assist you?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              ></textarea>
              <button
                type="button"
                onClick={() => alert('Thank you! Your inquiry has been dispatched to the shelter desk.')}
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm transition-colors shadow-sm"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
