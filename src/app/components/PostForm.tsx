import { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';

type PostFormProps = {
  onSubmitPost: (post: PostData) => void;
}

type PostData = {
  name: string;
  dyouthYear: string;
  province: string;
  isAnonymous: boolean;
  text: string;
  image?: File | null;
  imagePreview?: string;
}

const provinces = [
  'Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Équateur', 
  'Haut-Katanga', 'Kasaï', 'Kasaï Central',
  'Kwilu', 'Mai-Ndombe', 'Kongo Central', 
  // Add more provinces as needed
];

export default function PostForm({ onSubmitPost }: PostFormProps) {
  const [formData, setFormData] = useState<PostData>({
    name: '',
    dyouthYear: '',
    province: '',
    isAnonymous: false,
    text: '',
    image: null,
    imagePreview: undefined
  });

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmitPost(formData);
    
    // Reset form
    setFormData({
      name: '',
      dyouthYear: '',
      province: '',
      isAnonymous: false,
      text: '',
      image: null,
      imagePreview: undefined
    });
  };

  // Generate years from 2010 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => 2010 + i);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            {formData.isAnonymous ? 'Anonymous Post' : 'Your Name'}
          </label>
          <input 
            type="text"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            disabled={formData.isAnonymous}
            className="w-full p-2 border rounded-md"
            placeholder={formData.isAnonymous ? 'Posting anonymously' : 'Enter your name'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">D-Youth Year</label>
            <select 
              name="dyouthYear"
              value={formData.dyouthYear}
              onChange={handleTextChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Province</label>
            <select 
              name="province"
              value={formData.province}
              onChange={handleTextChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select province</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <input 
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label className="text-gray-700">Post anonymously</label>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Message</label>
          <textarea 
            name="text"
            value={formData.text}
            onChange={handleTextChange}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Share your thoughts..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Add Image (optional)</label>
          <input 
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md"
          />
          {formData.imagePreview && (
            <div className="mt-2">
              <img src={formData.imagePreview} alt="Preview" className="max-h-40 rounded" />
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Post
        </button>
      </form>
    </div>
  );
}