import React from 'react';
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
    description: 'Monica pursued her passion for cooking at the Culinary Institute of America. Her dedication and talent led her to become an executive chef in Manhattan, showcasing how culinary education can lead to a successful career in the restaurant industry.',
    image: monicaImg
  },
  {
    name: 'Homer Simpson',
    show: 'The Simpsons',
    education: 'Springfield University',
    career: 'Nuclear Safety Inspector',
    city: 'Springfield',
    description: 'After attending Springfield University, Homer found his calling in nuclear safety. His career path demonstrates how technical education can lead to stable employment in specialized industries.',
    image: homerImg
  },
  {
    name: 'Carrie Bradshaw',
    show: 'Sex and the City',
    education: 'New York University',
    career: 'Columnist/Author',
    city: 'New York City',
    description: 'Carrie\'s journalism degree from NYU paved the way for her successful career as a columnist and author. Her journey shows how a liberal arts education can lead to a creative and fulfilling career in media.',
    image: carrieImg
  },
  {
    name: 'Leslie Knope',
    show: 'Parks and Recreation',
    education: 'Indiana University',
    career: 'Public Servant',
    city: 'Pawnee, Indiana',
    description: 'Leslie\'s political science degree from Indiana University prepared her for a career in public service. Her story illustrates how higher education can lead to meaningful work in government and community development.',
    image: leslieImg
  },
  {
    name: 'Sheldon Cooper',
    show: 'The Big Bang Theory',
    education: 'Caltech (PhD)',
    career: 'Theoretical Physicist',
    city: 'Pasadena, CA',
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
          <div
            key={character.name}
            className="bg-white/50 backdrop-blur-sm rounded-xl shadow-sm transition-all hover:shadow-md border border-gray-200 flex flex-col items-start p-6 group"
            style={{ minHeight: 260 }}
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
            <div className="text-gray-600 mb-4 text-sm">
              {character.description}
            </div>
            <div className="mt-auto w-full flex justify-end">
              <a
                href="/career-explorer"
                className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold"
              >
                Explore Career Path
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CelebrityProfiles; 