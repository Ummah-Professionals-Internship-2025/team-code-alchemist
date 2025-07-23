import React, { useEffect, useState } from "react";
import { auth, db, storage } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Select from 'react-select';
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const FIELD_LABELS = [
  { key: 'firstName', label: 'First Name', disabled: true },
  { key: 'middleName', label: 'Middle Name', disabled: true },
  { key: 'lastName', label: 'Last Name', disabled: true },
  { key: 'email', label: 'Email', disabled: true },
  { key: 'phone', label: 'Phone Number' },
  { key: 'industry', label: 'Industry' },
  { key: 'major', label: 'Major' },
  { key: 'currentGrade', label: 'Current Grade' },
  { key: 'serviceLookingFor', label: 'Service Looking For' },
  { key: 'generalAvailability', label: 'General Availability' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'timeZone', label: 'Time Zone' },
  { key: 'country', label: 'Country' },
  { key: 'university', label: 'University' },
  { key: 'description', label: 'Description', textarea: true },
];

const timeIntervals = [
  '8am-9am', '9am-10am', '10am-11am', '11am-12pm', '12pm-1pm', '1pm-2pm', '2pm-3pm', '3pm-4pm', '4pm-5pm', '5pm-6pm', '6pm-7pm', '7pm-8pm'
].map(t => ({ value: t, label: t }));

function GeneralAvailabilityEditor({ value, onChange, disabled }) {
  const availability = value && typeof value === 'object' ? value : {};
  return (
    <div style={{ background: '#ededed', border: '1.5px solid #bbb', borderRadius: 8, padding: 16, marginTop: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#222', fontSize: '1em', marginBottom: 2, lineHeight: 1.1 }}>{day}</div>
            <input
              type="checkbox"
              checked={Array.isArray(availability[day])}
              onChange={e => {
                let newAvailability = { ...availability };
                if (e.target.checked) {
                  newAvailability[day] = Array.isArray(availability[day]) ? availability[day] : [];
                } else {
                  delete newAvailability[day];
                }
                onChange(newAvailability);
              }}
              style={{ margin: 0 }}
              disabled={disabled}
            />
            {Array.isArray(availability[day]) && (
              <Select
                isMulti
                isDisabled={disabled}
                options={timeIntervals}
                value={availability[day].map(val => timeIntervals.find(opt => opt.value === val)).filter(Boolean)}
                onChange={selected => {
                  const newAvailability = { ...availability, [day]: selected ? selected.map(opt => opt.value) : [] };
                  onChange(newAvailability);
                }}
                classNamePrefix="react-select"
                placeholder="Select times..."
                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const industryOptions = [
  { value: 'Business', label: 'Business' },
  { value: 'Education', label: 'Education' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Law', label: 'Law' },
  { value: 'Social Services', label: 'Social Services' },
  { value: 'Science', label: 'Science' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Other', label: 'Other' },
];
const majorOptions = [
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Actuarial Science', label: 'Actuarial Science' },
  { value: 'Advertising Major', label: 'Advertising Major' },
  { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
  { value: 'African Languages, Literatures, and Linguistics', label: 'African Languages, Literatures, and Linguistics' },
  { value: 'African Studies', label: 'African Studies' },
  { value: 'African-American Studies', label: 'African-American Studies' },
  { value: 'Agricultural Business and Management', label: 'Agricultural Business and Management' },
  { value: 'Agricultural Economics', label: 'Agricultural Economics' },
  { value: 'Agricultural Education', label: 'Agricultural Education' },
  { value: 'Agricultural Journalism', label: 'Agricultural Journalism' },
  { value: 'Agricultural Mechanization Major', label: 'Agricultural Mechanization Major' },
  { value: 'Agricultural Technology Management', label: 'Agricultural Technology Management' },
  { value: 'Agricultural/Biological Engineering and Bioengineering', label: 'Agricultural/Biological Engineering and Bioengineering' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Agronomy and Crop Science', label: 'Agronomy and Crop Science' },
  { value: 'Air Traffic Control', label: 'Air Traffic Control' },
  { value: 'American History', label: 'American History' },
  { value: 'American Literature', label: 'American Literature' },
  { value: 'American Sign Language', label: 'American Sign Language' },
  { value: 'American Studies', label: 'American Studies' },
  { value: 'Anatomy', label: 'Anatomy' },
  { value: 'Ancient Studies', label: 'Ancient Studies' },
  { value: 'Animal Behavior and Ethology', label: 'Animal Behavior and Ethology' },
  { value: 'Animal Science', label: 'Animal Science' },
  { value: 'Animation and Special Effects', label: 'Animation and Special Effects' },
  { value: 'Anthropology', label: 'Anthropology' },
  { value: 'Applied Mathematics', label: 'Applied Mathematics' },
  { value: 'Aquaculture', label: 'Aquaculture' },
  { value: 'Aquatic Biology', label: 'Aquatic Biology' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Archeology', label: 'Archeology' },
  { value: 'Architectural Engineering', label: 'Architectural Engineering' },
  { value: 'Architectural History', label: 'Architectural History' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Art', label: 'Art' },
  { value: 'Art Education', label: 'Art Education' },
  { value: 'Art History', label: 'Art History' },
  { value: 'Art Therapy', label: 'Art Therapy' },
  { value: 'Artificial Intelligence and Robotics', label: 'Artificial Intelligence and Robotics' },
  { value: 'Asian-American Studies', label: 'Asian-American Studies' },
  { value: 'Astronomy', label: 'Astronomy' },
  { value: 'Astrophysics', label: 'Astrophysics' },
  { value: 'Athletic Training', label: 'Athletic Training' },
  { value: 'Atmospheric Science', label: 'Atmospheric Science' },
  { value: 'Automotive Engineering', label: 'Automotive Engineering' },
  { value: 'Aviation', label: 'Aviation' },
  { value: 'Bakery Science', label: 'Bakery Science' },
  { value: 'Biblical Studies', label: 'Biblical Studies' },
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Bioethics', label: 'Bioethics' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Biomedical Science', label: 'Biomedical Science' },
  { value: 'Biopsychology', label: 'Biopsychology' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Botany/Plant Biology', label: 'Botany/Plant Biology' },
  { value: 'Business Administration/Management', label: 'Business Administration/Management' },
  { value: 'Business Communications', label: 'Business Communications' },
  { value: 'Business Education', label: 'Business Education' },
  { value: 'Canadian Studies', label: 'Canadian Studies' },
  { value: 'Caribbean Studies', label: 'Caribbean Studies' },
  { value: 'Cell Biology Major', label: 'Cell Biology Major' },
  { value: 'Ceramic Engineering', label: 'Ceramic Engineering' },
  { value: 'Ceramics', label: 'Ceramics' },
  { value: 'Chemical Engineering Major', label: 'Chemical Engineering Major' },
  { value: 'Chemical Physics', label: 'Chemical Physics' },
  { value: 'Chemistry Major', label: 'Chemistry Major' },
  { value: 'Child Care', label: 'Child Care' },
  { value: 'Child Development', label: 'Child Development' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Chiropractic', label: 'Chiropractic' },
  { value: 'Church Music', label: 'Church Music' },
  { value: 'Cinematography and Film/Video Production', label: 'Cinematography and Film/Video Production' },
  { value: 'Circulation Technology', label: 'Circulation Technology' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Classics', label: 'Classics' },
  { value: 'Clinical Psychology', label: 'Clinical Psychology' },
  { value: 'Cognitive Psychology', label: 'Cognitive Psychology' },
  { value: 'Communication Disorders', label: 'Communication Disorders' },
  { value: 'Communications Studies/Speech Communication and Rhetoric', label: 'Communications Studies/Speech Communication and Rhetoric' },
  { value: 'Comparative Literature', label: 'Comparative Literature' },
  { value: 'Computer and Information Science', label: 'Computer and Information Science' },
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Computer Graphics', label: 'Computer Graphics' },
  { value: 'Computer Systems Analysis Major', label: 'Computer Systems Analysis Major' },
  { value: 'Construction Management', label: 'Construction Management' },
  { value: 'Counseling', label: 'Counseling' },
  { value: 'Crafts', label: 'Crafts' },
  { value: 'Creative Writing', label: 'Creative Writing' },
  { value: 'Criminal Science', label: 'Criminal Science' },
  { value: 'Criminology', label: 'Criminology' },
  { value: 'Culinary Arts', label: 'Culinary Arts' },
  { value: 'Dance', label: 'Dance' },
  { value: 'Data Processing', label: 'Data Processing' },
  { value: 'Dental Hygiene', label: 'Dental Hygiene' },
  { value: 'Developmental Psychology', label: 'Developmental Psychology' },
  { value: 'Diagnostic Medical Sonography', label: 'Diagnostic Medical Sonography' },
  { value: 'Dietetics', label: 'Dietetics' },
  { value: 'Digital Communications and Media/Multimedia', label: 'Digital Communications and Media/Multimedia' },
  { value: 'Drawing', label: 'Drawing' },
  { value: 'Early Childhood Education', label: 'Early Childhood Education' },
  { value: 'East Asian Studies', label: 'East Asian Studies' },
  { value: 'East European Studies', label: 'East European Studies' },
  { value: 'Ecology', label: 'Ecology' },
  { value: 'Economics Major', label: 'Economics Major' },
  { value: 'Education', label: 'Education' },
  { value: 'Education Administration', label: 'Education Administration' },
  { value: 'Education of the Deaf', label: 'Education of the Deaf' },
  { value: 'Educational Psychology', label: 'Educational Psychology' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Elementary Education', label: 'Elementary Education' },
  { value: 'Engineering Mechanics', label: 'Engineering Mechanics' },
  { value: 'Engineering Physics', label: 'Engineering Physics' },
  { value: 'English', label: 'English' },
  { value: 'English Composition', label: 'English Composition' },
  { value: 'English Literature Major', label: 'English Literature Major' },
  { value: 'Entomology', label: 'Entomology' },
  { value: 'Entrepreneurship Major', label: 'Entrepreneurship Major' },
  { value: 'Environmental Design/Architecture', label: 'Environmental Design/Architecture' },
  { value: 'Environmental Science', label: 'Environmental Science' },
  { value: 'Environmental/Environmental Health Engineering', label: 'Environmental/Environmental Health Engineering' },
  { value: 'Epidemiology', label: 'Epidemiology' },
  { value: 'Equine Studies', label: 'Equine Studies' },
  { value: 'Ethnic Studies', label: 'Ethnic Studies' },
  { value: 'European History', label: 'European History' },
  { value: 'Experimental Pathology', label: 'Experimental Pathology' },
  { value: 'Experimental Psychology', label: 'Experimental Psychology' },
  { value: 'Fashion Design', label: 'Fashion Design' },
  { value: 'Fashion Merchandising', label: 'Fashion Merchandising' },
  { value: 'Feed Science', label: 'Feed Science' },
  { value: 'Fiber, Textiles, and Weaving Arts', label: 'Fiber, Textiles, and Weaving Arts' },
  { value: 'Film', label: 'Film' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Floriculture', label: 'Floriculture' },
  { value: 'Food Science', label: 'Food Science' },
  { value: 'Forensic Science', label: 'Forensic Science' },
  { value: 'Forestry', label: 'Forestry' },
  { value: 'French', label: 'French' },
  { value: 'Furniture Design', label: 'Furniture Design' },
  { value: 'Game Design', label: 'Game Design' },
  { value: 'Gay and Lesbian Studies', label: 'Gay and Lesbian Studies' },
  { value: 'Genetics', label: 'Genetics' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Geological Engineering', label: 'Geological Engineering' },
  { value: 'Geology', label: 'Geology' },
  { value: 'Geophysics', label: 'Geophysics' },
  { value: 'German', label: 'German' },
  { value: 'Gerontology', label: 'Gerontology' },
  { value: 'Government Major', label: 'Government Major' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Health Administration', label: 'Health Administration' },
  { value: 'Hebrew', label: 'Hebrew' },
  { value: 'Hispanic-American, Puerto Rican, and Chicano Studies', label: 'Hispanic-American, Puerto Rican, and Chicano Studies' },
  { value: 'Historic Preservation', label: 'Historic Preservation' },
  { value: 'History', label: 'History' },
  { value: 'Home Economics', label: 'Home Economics' },
  { value: 'Horticulture', label: 'Horticulture' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Human Development', label: 'Human Development' },
  { value: 'Human Resources Management Major', label: 'Human Resources Management Major' },
  { value: 'Illustration', label: 'Illustration' },
  { value: 'Industrial Design', label: 'Industrial Design' },
  { value: 'Industrial Engineering', label: 'Industrial Engineering' },
  { value: 'Industrial Management', label: 'Industrial Management' },
  { value: 'Industrial Psychology', label: 'Industrial Psychology' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Interior Architecture', label: 'Interior Architecture' },
  { value: 'Interior Design', label: 'Interior Design' },
  { value: 'International Agriculture', label: 'International Agriculture' },
  { value: 'International Business', label: 'International Business' },
  { value: 'International Relations', label: 'International Relations' },
  { value: 'International Studies', label: 'International Studies' },
  { value: 'Islamic Studies', label: 'Islamic Studies' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Jazz Studies', label: 'Jazz Studies' },
  { value: 'Jewelry and Metalsmithing', label: 'Jewelry and Metalsmithing' },
  { value: 'Jewish Studies', label: 'Jewish Studies' },
  { value: 'Journalism', label: 'Journalism' },
  { value: 'Kinesiology', label: 'Kinesiology' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Land Use Planning and Management', label: 'Land Use Planning and Management' },
  { value: 'Landscape Architecture', label: 'Landscape Architecture' },
  { value: 'Landscape Horticulture', label: 'Landscape Horticulture' },
  { value: 'Latin American Studies', label: 'Latin American Studies' },
  { value: 'Library Science', label: 'Library Science' },
  { value: 'Linguistics', label: 'Linguistics' },
  { value: 'Logistics Management', label: 'Logistics Management' },
  { value: 'Management Information Systems', label: 'Management Information Systems' },
  { value: 'Managerial Economics', label: 'Managerial Economics' },
  { value: 'Marine Biology Major', label: 'Marine Biology Major' },
  { value: 'Marine Science', label: 'Marine Science' },
  { value: 'Marketing Major', label: 'Marketing Major' },
  { value: 'Mass Communication', label: 'Mass Communication' },
  { value: 'Massage Therapy', label: 'Massage Therapy' },
  { value: 'Materials Science', label: 'Materials Science' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Medical Technology', label: 'Medical Technology' },
  { value: 'Medieval and Renaissance Studies', label: 'Medieval and Renaissance Studies' },
  { value: 'Mental Health Services', label: 'Mental Health Services' },
  { value: 'Merchandising and Buying Operations', label: 'Merchandising and Buying Operations' },
  { value: 'Metallurgical Engineering', label: 'Metallurgical Engineering' },
  { value: 'Microbiology', label: 'Microbiology' },
  { value: 'Middle Eastern Studies', label: 'Middle Eastern Studies' },
  { value: 'Military Science', label: 'Military Science' },
  { value: 'Mineral Engineering', label: 'Mineral Engineering' },
  { value: 'Missions', label: 'Missions' },
  { value: 'Modern Greek', label: 'Modern Greek' },
  { value: 'Molecular Biology', label: 'Molecular Biology' },
  { value: 'Molecular Genetics', label: 'Molecular Genetics' },
  { value: 'Mortuary Science', label: 'Mortuary Science' },
  { value: 'Museum Studies', label: 'Museum Studies' },
  { value: 'Music', label: 'Music' },
  { value: 'Music Education', label: 'Music Education' },
  { value: 'Music History Major', label: 'Music History Major' },
  { value: 'Music Management', label: 'Music Management' },
  { value: 'Music Therapy', label: 'Music Therapy' },
  { value: 'Musical Theater', label: 'Musical Theater' },
  { value: 'Native American Studies', label: 'Native American Studies' },
  { value: 'Natural Resources Conservation', label: 'Natural Resources Conservation' },
  { value: 'Naval Architecture', label: 'Naval Architecture' },
  { value: 'Neurobiology', label: 'Neurobiology' },
  { value: 'Neuroscience', label: 'Neuroscience' },
  { value: 'Nuclear Engineering', label: 'Nuclear Engineering' },
  { value: 'Nursing Major', label: 'Nursing Major' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Occupational Therapy', label: 'Occupational Therapy' },
  { value: 'Ocean Engineering', label: 'Ocean Engineering' },
  { value: 'Oceanography', label: 'Oceanography' },
  { value: 'Operations Management', label: 'Operations Management' },
  { value: 'Organizational Behavior Studies', label: 'Organizational Behavior Studies' },
  { value: 'Painting', label: 'Painting' },
  { value: 'Paleontology', label: 'Paleontology' },
  { value: 'Pastoral Studies', label: 'Pastoral Studies' },
  { value: 'Peace Studies', label: 'Peace Studies' },
  { value: 'Petroleum Engineering', label: 'Petroleum Engineering' },
  { value: 'Pharmacology', label: 'Pharmacology' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Philosophy', label: 'Philosophy' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Photojournalism Major', label: 'Photojournalism Major' },
  { value: 'Physical Education', label: 'Physical Education' },
  { value: 'Physical Therapy', label: 'Physical Therapy' },
  { value: 'Physician Assistant', label: 'Physician Assistant' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Physiological Psychology', label: 'Physiological Psychology' },
  { value: 'Piano', label: 'Piano' },
  { value: 'Planetary Science', label: 'Planetary Science' },
  { value: 'Plant Pathology', label: 'Plant Pathology' },
  { value: 'Playwriting and Screenwriting', label: 'Playwriting and Screenwriting' },
  { value: 'Political Communication', label: 'Political Communication' },
  { value: 'Political Science Major', label: 'Political Science Major' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Pre-Dentistry', label: 'Pre-Dentistry' },
  { value: 'Pre-Law', label: 'Pre-Law' },
  { value: 'Pre-Medicine', label: 'Pre-Medicine' },
  { value: 'Pre-Optometry', label: 'Pre-Optometry' },
  { value: 'Pre-Seminary', label: 'Pre-Seminary' },
  { value: 'Pre-Veterinary Medicine', label: 'Pre-Veterinary Medicine' },
  { value: 'Printmaking', label: 'Printmaking' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Public Administration', label: 'Public Administration' },
  { value: 'Public Health', label: 'Public Health' },
  { value: 'Public Policy Analysis', label: 'Public Policy Analysis' },
  { value: 'Public Relations Major', label: 'Public Relations Major' },
  { value: 'Radio and Television', label: 'Radio and Television' },
  { value: 'Radiologic Technology', label: 'Radiologic Technology' },
  { value: 'Range Science and Management', label: 'Range Science and Management' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Recording Arts Technology', label: 'Recording Arts Technology' },
  { value: 'Recreation Management', label: 'Recreation Management' },
  { value: 'Rehabilitation Services', label: 'Rehabilitation Services' },
  { value: 'Religious Studies', label: 'Religious Studies' },
  { value: 'Respiratory Therapy', label: 'Respiratory Therapy' },
  { value: 'Risk Management', label: 'Risk Management' },
  { value: 'Rural Sociology', label: 'Rural Sociology' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Scandinavian Studies', label: 'Scandinavian Studies' },
  { value: 'Sculpture', label: 'Sculpture' },
  { value: 'Slavic Languages and Literatures', label: 'Slavic Languages and Literatures' },
  { value: 'Social Psychology', label: 'Social Psychology' },
  { value: 'Social Work', label: 'Social Work' },
  { value: 'Sociology', label: 'Sociology' },
  { value: 'Soil Science', label: 'Soil Science' },
  { value: 'Sound Engineering', label: 'Sound Engineering' },
  { value: 'South Asian Studies', label: 'South Asian Studies' },
  { value: 'Southeast Asia Studies', label: 'Southeast Asia Studies' },
  { value: 'Spanish Major', label: 'Spanish Major' },
  { value: 'Special Education', label: 'Special Education' },
  { value: 'Speech Pathology', label: 'Speech Pathology' },
  { value: 'Sport and Leisure Studies', label: 'Sport and Leisure Studies' },
  { value: 'Sports Management', label: 'Sports Management' },
  { value: 'Statistics Major', label: 'Statistics Major' },
  { value: 'Surveying', label: 'Surveying' },
  { value: 'Sustainable Resource Management', label: 'Sustainable Resource Management' },
  { value: 'Teacher Education', label: 'Teacher Education' },
  { value: 'Teaching English as a Second Language', label: 'Teaching English as a Second Language' },
  { value: 'Technical Writing', label: 'Technical Writing' },
  { value: 'Technology Education', label: 'Technology Education' },
  { value: 'Textile Engineering', label: 'Textile Engineering' },
  { value: 'Theatre', label: 'Theatre' },
  { value: 'Theology', label: 'Theology' },
  { value: 'Tourism', label: 'Tourism' },
  { value: 'Toxicology', label: 'Toxicology' },
  { value: 'Turfgrass Science', label: 'Turfgrass Science' },
  { value: 'Urban Planning', label: 'Urban Planning' },
  { value: 'Urban Studies', label: 'Urban Studies' },
  { value: 'Visual Communication', label: 'Visual Communication' },
  { value: 'Voice', label: 'Voice' },
  { value: 'Web Design', label: 'Web Design' },
  { value: 'Webmaster and Web Management', label: 'Webmaster and Web Management' },
  { value: 'Welding Engineering', label: 'Welding Engineering' },
  { value: 'Wildlife Management', label: 'Wildlife Management' },
  { value: 'Women\'s Studies', label: 'Women\'s Studies' },
  { value: 'Youth Ministries', label: 'Youth Ministries' },
  { value: 'Zoology', label: 'Zoology' },
  { value: 'Other', label: 'Other' },
];
const gradeOptions = [
  { value: 'Highschooler', label: 'Highschooler' },
  { value: 'Freshman in college', label: 'Freshman in college' },
  { value: 'Sophomore in college', label: 'Sophomore in college' },
  { value: 'Junior in college', label: 'Junior in college' },
  { value: 'Senior in college', label: 'Senior in college' },
  { value: 'Graduated', label: 'Graduated' },
];
const serviceOptions = [
  { value: 'Career advice', label: 'Career advice' },
  { value: 'Resume review', label: 'Resume review' },
  { value: 'Interview prep', label: 'Interview prep' },
];

export default function ProfilePage({ onBack, user }) {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        setProfile({});
        return;
      }
      const docRef = doc(db, "mentees", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setDirty(true);
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "mentees", user.uid);
    await updateDoc(docRef, profile);
    setDirty(false);
    setSaving(false);
    alert("Update saved!");
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    const storageRef = ref(storage, `profilePics/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProfile({ ...profile, profilePic: url });
    setDirty(true);
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    const storageRef = ref(storage, `resumes/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setProfile({ ...profile, resumeUrl: url });
    setDirty(true);
  };

  const tryBack = () => {
    if (dirty) setShowModal(true);
    else onBack();
  };

  if (loading) return <div style={{ color: '#E7E8EE', fontSize: 24, padding: 40 }}>Loading...</div>;
  if (!profile) return <div style={{ color: '#E7E8EE', fontSize: 24, padding: 40 }}>No profile found.</div>;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#E7E8EE', padding: '48px 0', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Profile Picture and Upload */}
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, minWidth: 220 }}>
          <img
            src={profile.profilePic || DEFAULT_AVATAR}
            alt="Profile"
            style={{ width: 180, height: 180, borderRadius: "50%", objectFit: "cover", border: "4px solid #8ACBDB", marginBottom: 16 }}
          />
          <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ fontSize: 18 }} />
        </div>
        {/* Main Profile Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, minWidth: 400 }}>
          <div>
            <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 8, color: '#007CA6' }}>Profile</h1>
            <div style={{ color: '#8ACBDB', fontSize: 22, marginBottom: 32 }}>View and update your information</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, width: '100%' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>First Name</div>
                <input value={profile.firstName || ''} disabled style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10, background: '#f7f7f7' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Middle Name</div>
                <input value={profile.middleName || ''} disabled style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10, background: '#f7f7f7' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Last Name</div>
                <input value={profile.lastName || ''} disabled style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10, background: '#f7f7f7' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Email</div>
                <input value={profile.email || ''} disabled style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10, background: '#f7f7f7' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Phone Number</div>
                <input name="phone" value={profile.phone || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Industry</div>
                <Select
                  isMulti
                  name="industry"
                  options={industryOptions}
                  value={industryOptions.filter(opt => (profile.industry || []).includes(opt.value))}
                  onChange={selected => { setDirty(true); setProfile({ ...profile, industry: selected ? selected.map(opt => opt.value) : [] }); }}
                  classNamePrefix="react-select"
                  placeholder="Select industry..."
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Major</div>
                <Select
                  name="major"
                  options={majorOptions}
                  value={majorOptions.find(opt => opt.value === profile.major) || null}
                  onChange={selected => { setDirty(true); setProfile({ ...profile, major: selected ? selected.value : '' }); }}
                  classNamePrefix="react-select"
                  placeholder="Select major..."
                  isClearable
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Current Grade</div>
                <Select
                  name="currentGrade"
                  options={gradeOptions}
                  value={gradeOptions.find(opt => opt.value === profile.currentGrade) || null}
                  onChange={selected => { setDirty(true); setProfile({ ...profile, currentGrade: selected ? selected.value : '' }); }}
                  classNamePrefix="react-select"
                  placeholder="Select grade..."
                  isClearable
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Service Looking For</div>
                <Select
                  name="serviceLookingFor"
                  options={serviceOptions}
                  value={serviceOptions.find(opt => opt.value === profile.serviceLookingFor) || null}
                  onChange={selected => { setDirty(true); setProfile({ ...profile, serviceLookingFor: selected ? selected.value : '' }); }}
                  classNamePrefix="react-select"
                  placeholder="Select service..."
                  isClearable
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>General Availability</div>
                <div style={{ width: '100%', background: '#ededed', border: '1.5px solid #bbb', borderRadius: 8, padding: 24, marginTop: 4 }}>
                  <GeneralAvailabilityEditor
                    value={profile.generalAvailability}
                    onChange={val => { setDirty(true); setProfile({ ...profile, generalAvailability: val }); }}
                    disabled={false}
                    dropdownWidth={500}
                  />
                </div>
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>GitHub</div>
                <input name="github" value={profile.github || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>LinkedIn</div>
                <input name="linkedin" value={profile.linkedin || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Time Zone</div>
                <input name="timeZone" value={profile.timeZone || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Country</div>
                <input name="country" value={profile.country || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>University</div>
                <input name="university" value={profile.university || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} />
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Description</div>
                <textarea name="description" value={profile.description || ''} onChange={handleChange} style={{ width: '100%', fontSize: 20, minHeight: 80, borderRadius: 8, border: '1.5px solid #bbb', padding: 10 }} placeholder="Description" />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24, fontSize: 22 }}>
            <label style={{ fontWeight: 700, marginRight: 16 }}>Resume</label>
            {profile.resumeUrl && (
              <button
                style={{ marginRight: 18, color: '#1976d2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setShowResumeModal(true)}
              >
                View Current
              </button>
            )}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} style={{ fontSize: 18 }} />
          </div>
          {dirty && (
            <button onClick={handleSave} disabled={saving} style={{ marginTop: 32, fontSize: 22, padding: '12px 40px', borderRadius: 10, background: '#1976d2', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          {showModal && (
            <div style={{ background: "#fff", border: "1.5px solid #bbb", borderRadius: 12, padding: 32, position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, fontSize: 22 }}>
              <p>Are you sure you want to go back without saving?</p>
              <button onClick={() => { setShowModal(false); onBack(); }} style={{ marginRight: 18, fontSize: 20, padding: '8px 24px', borderRadius: 8, background: '#d32f2f', color: '#fff', border: 'none', fontWeight: 600 }}>Yes</button>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 20, padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}>Cancel</button>
            </div>
          )}
          {/* Resume Modal */}
          {showResumeModal && profile.resumeUrl && (
            <div style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 12, padding: 24, maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 2px 32px rgba(0,0,0,0.20)', position: 'relative'
              }}>
                <button
                  onClick={() => setShowResumeModal(false)}
                  style={{
                    position: 'absolute', top: 12, right: 18, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f'
                  }}
                  aria-label="Close"
                >×</button>
                <iframe
                  src={profile.resumeUrl}
                  title="Resume"
                  style={{ width: '70vw', height: '80vh', border: 'none' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 