import React, { useState, useRef } from 'react';
import { Layers, Edit3, Save, X, Plus } from 'lucide-react';

interface EditableTitleProps {
  section: KnowledgeSection;
  onEdit: () => void;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  onClick: () => void;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ section, onEdit, onSave, onCancel, onClick }) => {
  const [tempTitle, setTempTitle] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (section.titleEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [section.titleEditing]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave(tempTitle);
    } else if (e.key === 'Escape') {
      setTempTitle(section.title);
      onCancel();
    }
  };

  if (section.titleEditing) {
    return (
      <div className="flex items-center space-x-1 p-1 bg-green-50 rounded">
        <input
          ref={inputRef}
          type="text"
          value={tempTitle}
          onChange={(e) => setTempTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button
          onClick={() => onSave(tempTitle)}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
        >
          <Save size={12} />
        </button>
        <button
          onClick={() => {
            setTempTitle(section.title);
            onCancel();
          }}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between hover:bg-green-50 rounded p-1">
      <button
        onClick={onClick}
        className="flex-1 text-left text-sm text-gray-700 hover:text-green-700 transition-colors"
      >
        {section.title}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTempTitle(section.title);
          onEdit();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-green-600 transition-all"
      >
        <Edit3 size={12} />
      </button>
    </div>
  );
};

interface KnowledgeSection {
  id: string;
  title: string;
  content: string;
  isEditing?: boolean;
  titleEditing?: boolean;
}

const KnowledgeSourcesPage: React.FC = () => {
  const [sections, setSections] = useState<KnowledgeSection[]>([
    {
      id: 'overview',
      title: 'Overview',
      content: `SmartAcademy is Kenya's leading digital skills training platform designed to bridge the digital skills gap and equip citizens with relevant skills for the digital economy.

Our mission is to provide comprehensive digital skills training across various proficiency levels, from foundational to advanced, ensuring that learners can effectively participate in the modern digital workforce.

Key Features:
- Digital Skills Training Programs
- Career Guidance and Development
- Industry-Standard Certifications
- Hands-on Practical Experience`,
    },
    {
      id: 'programs',
      title: 'Training Programs',
      content: `SmartAcademy offers a wide range of training programs designed to meet the diverse needs of our learners:

1. Foundational Digital Skills
   - Computer basics and digital literacy
   - Internet navigation and email communication
   - Basic office applications

2. Intermediate Programs
   - Web development fundamentals
   - Data analysis and visualization
   - Digital marketing essentials

3. Advanced Specializations
   - Artificial Intelligence and Machine Learning
   - Cybersecurity and Information Security
   - Cloud Computing and DevOps

4. Professional Certifications
   - Industry-recognized certifications
   - Partnership with leading tech companies
   - Continuous assessment and evaluation`,
    },
    {
      id: 'payments',
      title: 'Payments & Pricing',
      content: `SmartAcademy offers flexible payment options to make digital skills training accessible to everyone:

Pricing Structure:
- Foundational Courses: Free of charge
- Basic Programs: KES 5,000 - 15,000
- Intermediate Programs: KES 20,000 - 35,000
- Advanced Specializations: KES 40,000 - 75,000

Payment Methods:
- M-Pesa Mobile Money
- Bank Transfer
- Credit/Debit Cards
- Installment Plans Available

Financial Assistance:
- Government subsidized programs
- Scholarship opportunities for qualified candidates
- Corporate training packages
- Group discounts for institutions`,
    },
    {
      id: 'enrollment',
      title: 'Enrollment Process',
      content: `Getting started with SmartAcademy is simple and straightforward:

Step 1: Registration
- Create your account on our platform
- Complete your profile information
- Upload required documents

Step 2: Course Selection
- Browse available programs
- Review course curriculum
- Check prerequisites and requirements

Step 3: Payment
- Choose your preferred payment method
- Complete payment process
- Receive enrollment confirmation

Step 4: Access Materials
- Login to your student portal
- Download course materials
- Join virtual classrooms

Step 5: Begin Learning
- Follow the structured curriculum
- Participate in hands-on projects
- Engage with instructors and peers`,
    },
    {
      id: 'support',
      title: 'Student Support',
      content: `We provide comprehensive support to ensure your success throughout your learning journey:

Technical Support:
- 24/7 platform assistance
- Technical troubleshooting
- Device and software guidance

Academic Support:
- Dedicated instructors and mentors
- Peer learning communities
- Regular progress assessments
- One-on-one consultation sessions

Career Services:
- Job placement assistance
- Resume and portfolio review
- Interview preparation
- Industry networking opportunities

Resources:
- Online library and resources
- Practice labs and environments
- Certification preparation materials
- Alumni network access`,
    },
  ]);

  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = contentRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const handleEdit = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: true }
        : { ...section, isEditing: false }
    ));
  };

  const handleSave = (sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content: newContent, isEditing: false }
        : section
    ));
  };

  const handleCancel = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEditing: false }
        : section
    ));
  };

  const handleTitleEdit = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, titleEditing: true }
        : { ...section, titleEditing: false }
    ));
  };

  const handleTitleSave = (sectionId: string, newTitle: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, title: newTitle, titleEditing: false }
        : section
    ));
  };

  const handleTitleCancel = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, titleEditing: false }
        : section
    ));
  };

  const addNewSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection: KnowledgeSection = {
      id: newId,
      title: 'New Section',
      content: 'Enter your content here...',
      isEditing: true
    };
    setSections(prev => [...prev, newSection]);
  };

  return (
    <div className="w-[78vw] min-h-[85vh] bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-lg">
              <Layers size={28} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Knowledge Sources</h2>
              <p className="text-gray-600 mt-1">Manage and edit AI knowledge base content</p>
            </div>
          </div>
          
          <button
            onClick={addNewSection}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex h-[75vh]">
        {/* Table of Contents - 15% */}
        <div className="w-[15%] border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">
            Table of Contents
          </h3>
          <nav className="space-y-2">
            {sections.map((section) => (
              <EditableTitle
                key={section.id}
                section={section}
                onEdit={() => handleTitleEdit(section.id)}
                onSave={(newTitle) => handleTitleSave(section.id, newTitle)}
                onCancel={() => handleTitleCancel(section.id)}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </nav>
        </div>

        {/* Content Area - 85% */}
        <div className="w-[85%] overflow-y-auto">
          <div className="p-6 space-y-8">
            {sections.map((section) => (
              <div
                key={section.id}
                ref={el => { contentRefs.current[section.id] = el; }}
                className="border-b border-gray-200 pb-8 last:border-b-0"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                  {!section.isEditing && (
                    <button
                      onClick={() => handleEdit(section.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Section Content */}
                <div className="prose max-w-none">
                  {section.isEditing ? (
                    <EditableContent
                      content={section.content}
                      onSave={(content) => handleSave(section.id, content)}
                      onCancel={() => handleCancel(section.id)}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Editable Content Component
interface EditableContentProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

const EditableContent: React.FC<EditableContentProps> = ({ content, onSave, onCancel }) => {
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onSave(editContent);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none outline-none"
        placeholder="Enter your content here..."
      />
      
      <div className="flex items-center space-x-3">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default KnowledgeSourcesPage;