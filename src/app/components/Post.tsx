

type PostProps = {
  id: string;
  name: string;
  dyouthYear: string;
  province: string;
  isAnonymous: boolean;
  text: string;
  imageUrl?: string;
  timestamp: string;
}

export default function Post({ 
  name, 
  dyouthYear, 
  province, 
  isAnonymous, 
  text, 
  imageUrl, 
  timestamp 
}: PostProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
          {isAnonymous ? 'A' : name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <h3 className="font-medium">{isAnonymous ? 'Anonymous' : name}</h3>
          <div className="text-xs text-gray-500">
            {dyouthYear} • {province} • {timestamp}
          </div>
        </div>
      </div>
      
      <p className="mb-3">{text}</p>
      
      {imageUrl && (
        <div className="mb-3">
          <img 
            src={imageUrl} 
            alt="Post image" 
            className="rounded-md max-h-96 w-auto" 
          />
        </div>
      )}
    </div>
  );
}