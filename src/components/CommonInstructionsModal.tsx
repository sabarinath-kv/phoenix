import { Button } from "./ui/button";

interface Instruction {
  icon: string;
  text: string;
  subtext: string;
}

interface CommonInstructionsModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  instructions: Instruction[];
  onStartGame: () => void;
  buttonText?: string;
}

export const CommonInstructionsModal = ({ 
  isOpen, 
  title, 
  subtitle, 
  instructions, 
  onStartGame,
  buttonText = "LET'S START"
}: CommonInstructionsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 mx-4 max-w-md w-full">
        {/* Header - No top icon as per requirement */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>
            {title}
          </h2>
          <p className="text-lg" style={{ color: '#383534' }}>
            {subtitle}
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-8">
          {instructions.map((instruction, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 rounded-2xl p-4" 
              style={{ backgroundColor: '#F9F5F2' }}
            >
              <div className="text-3xl">{instruction.icon}</div>
              <div>
                <p className="font-bold" style={{ color: '#000000' }}>
                  {instruction.text}
                </p>
                <p className="text-sm" style={{ color: '#383534' }}>
                  {instruction.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Start Button - Updated to match Figma design */}
        <div className="text-center">
          <Button 
            onClick={onStartGame}
            className="w-full rounded-full px-6 py-4 text-white font-semibold text-sm tracking-wider border transition-all duration-300"
            style={{
              backgroundColor: '#0957D0',
              borderColor: '#083376',
              borderWidth: '1px',
              boxShadow: '0px 3px 0px 3px #083376',
              letterSpacing: '2.86%'
            }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
