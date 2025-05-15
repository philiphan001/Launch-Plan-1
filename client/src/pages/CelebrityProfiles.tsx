import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Disclosure, Transition } from '@headlessui/react';
import homerImg from '../assets/Homer Simpson PNG image with transparent background.jpeg';
import monicaImg from '../assets/monica-geller-121.jpeg';
import leslieImg from '../assets/Leslie_Knope_(played_by_Amy_Poehler).png';
import carrieImg from '../assets/carrie bradshaw.jpg';
import sheldonImg from '../assets/sheldon-cooper-personnage.jpg';

const celebrityCharacters = [
  {
    name: 'Monica Geller',
    show: 'Friends',
    education: 'Culinary Institute of America',
    career: 'Executive Chef',
    city: 'New York City',
    livingDetails: 'Rent-controlled 2-bedroom apartment (inherited from grandmother)',
    estimatedIncome: 95000,
    economicRealism: 4,
    economicReasonings: [
      'Unrealistic apartment size for Manhattan on chef salary',
      'Even with rent control, apartment would cost majority of take-home pay',
      'High-end apartment furnishings exceed typical budget',
      'Frequent entertaining and dining out beyond means'
    ],
    description: 'Monica pursued her passion for cooking at the Culinary Institute of America. Her dedication and talent led her to become an executive chef in Manhattan, showcasing how culinary education can lead to a successful career in the restaurant industry.',
    image: monicaImg
  },
  {
    name: 'Homer Simpson',
    show: 'The Simpsons',
    education: 'Springfield University',
    career: 'Nuclear Safety Inspector',
    city: 'Springfield',
    livingDetails: 'Owns 4-bedroom family home at 742 Evergreen Terrace',
    estimatedIncome: 141000,
    economicRealism: 6,
    economicReasonings: ['Salary matches industry standards', 'Home ownership feasible in suburban area', 'Questions about qualifications for position'],
    description: 'After attending Springfield University, Homer found his calling in nuclear safety. His career path demonstrates how technical education can lead to stable employment in specialized industries.',
    image: homerImg
  },
  {
    name: 'Carrie Bradshaw',
    show: 'Sex and the City',
    education: 'New York University',
    career: 'Columnist/Author',
    city: 'New York City',
    livingDetails: 'Upper East Side studio apartment',
    estimatedIncome: 85000,
    economicRealism: 0,
    economicReasonings: [
      'Entry-level columnist salary cannot support Upper East Side rent',
      'Designer wardrobe collection worth hundreds of thousands',
      'Weekly fine dining and nightlife beyond realistic budget',
      'No visible financial struggles despite luxury lifestyle',
      'Manhattan lifestyle impossible on single columnist income'
    ],
    description: 'Carrie\'s journalism degree from NYU paved the way for her successful career as a columnist and author. Her journey shows how a liberal arts education can lead to a creative and fulfilling career in media.',
    image: carrieImg
  },
  {
    name: 'Leslie Knope',
    show: 'Parks and Recreation',
    education: 'Indiana University',
    career: 'Public Servant',
    city: 'Pawnee, Indiana',
    livingDetails: 'Owns a craftsman-style home with husband Ben Wyatt',
    estimatedIncome: 120000, // Senior Public Administrator salary
    economicRealism: 9,
    economicReasonings: ['Accurate government salary scale', 'Reasonable home ownership in Indiana', 'Realistic career progression in public sector'],
    description: 'Leslie\'s political science degree from Indiana University prepared her for a career in public service. Her story illustrates how higher education can lead to meaningful work in government and community development.',
    image: leslieImg
  },
  {
    name: 'Sheldon Cooper',
    show: 'The Big Bang Theory',
    education: 'Caltech (PhD)',
    career: 'Theoretical Physicist',
    city: 'Pasadena, CA',
    livingDetails: '2-bedroom apartment shared with roommate Leonard',
    estimatedIncome: 165000, // Senior Research Physicist at university
    economicRealism: 8,
    economicReasonings: ['Academic salary matches position', 'Shared housing common in high-cost area', 'Education-to-career path accurate'],
    description: 'Sheldon\'s advanced education at Caltech led to a distinguished career in theoretical physics. His path demonstrates how advanced degrees in STEM fields can open doors to research and academic positions.',
    image: sheldonImg
  },
];

const CelebrityProfiles = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Education & Career Paths</h1>
      <p className="text-gray-600 mb-8">
        Explore how education shaped the careers of these fictional characters. Discover how different academic paths can lead to diverse and fulfilling professional journeys.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {celebrityCharacters.map((character) => (
          <motion.div
            key={character.name}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ 
              scale: 1.02,
              rotate: 2,
              transition: { 
                duration: 0.2,
                ease: "easeOut" 
              } 
            }}
            style={{
              position: "relative",
              transformOrigin: "center center",
              willChange: "transform"
            }}
            className="h-full"
          >
            <div
              className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm transition-all hover:shadow-md border border-gray-200 flex flex-col items-start p-6 group h-full"
            >
              <div className="flex items-center mb-2">
                {character.image && (
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-12 h-12 rounded-full object-cover mr-3 border border-gray-200"
                  />
                )}
                <div>
                  <span className="font-bold text-lg text-gray-900">
                    {character.name}
                  </span>
                  <span className="ml-2 text-gray-500 text-sm font-medium">
                    ({character.show})
                  </span>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Education:</span> {character.education}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Career:</span> {character.career}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">City:</span> {character.city}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Living Situation:</span> {character.livingDetails}
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Estimated Income:</span> ${character.estimatedIncome.toLocaleString()}/year
              </div>
              <Disclosure>
                {({ open }: { open: boolean }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center mb-2 text-left">
                      <span className="font-semibold text-gray-700">Economic Realism Score: 
                        <span className={`ml-2 font-medium ${
                          character.economicRealism >= 8 ? 'text-green-600' :
                          character.economicRealism >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {character.economicRealism}/10
                        </span>
                      </span>
                      <ChevronDownIcon
                        className={`${
                          open ? 'transform rotate-180' : ''
                        } w-5 h-5 text-gray-500 transition-transform duration-200`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="mb-4 text-sm">
                        <span className="font-semibold text-gray-700">Economic Analysis:</span>
                        <ul className="list-disc list-inside mt-1 text-gray-600">
                          {character.economicReasonings.map((reason, index) => (
                            <li key={index} className="ml-2">{reason}</li>
                          ))}
                        </ul>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
              <div className="text-gray-600 mb-4 text-sm">
                {character.description}
              </div>
              <div className="mt-auto w-full flex justify-end">
                <a
                  href={`/financial-projections?education=${encodeURIComponent(character.education)}&career=${encodeURIComponent(character.career)}&city=${encodeURIComponent(character.city)}&name=${encodeURIComponent(character.name)}`}
                  className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold"
                >
                  I want to be {character.name}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CelebrityProfiles; 