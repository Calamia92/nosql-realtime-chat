import React from "react";
import { Button, Container, Row, Col, Image } from "react-bootstrap";
import { FaCommentDots, FaUserFriends } from "react-icons/fa";  // Icônes Font Awesome
import Footer from "../components/Footer.js"; // Assure-toi que le chemin est correct

import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const startConversation = () => {
    navigate('/conversations');  // Redirige vers la page des conversations
  };

  return (
    <div className="d-flex flex-column" style={{ height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Container 
        fluid 
        className="d-flex justify-content-center align-items-center" 
        style={{ flex: 1, backgroundColor: '#222', color: '#fff', padding: '50px' }}
      >
        <Row className="text-center">
          <Col>
            <h1 
              className="text-white" 
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
                marginBottom: '30px',
              }}
            >
              Bienvenue sur ChatApp
            </h1>
            <p 
              className="lead" 
              style={{
                fontSize: '1.2rem', 
                marginBottom: '40px', 
                color: '#ccc', 
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              Connecte-toi avec tes amis, échange des messages instantanés et reste toujours à jour !
            </p>
            <div className="mb-4">
              <p 
                style={{
                  fontSize: '1rem', 
                  color: '#ccc',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                }}
              >
                <FaCommentDots /> Démarre une conversation privée avec tes amis, 
                ou <FaUserFriends /> rejoins des discussions de groupe.
              </p>
            </div>
            <Button 
              variant="success" 
              size="lg" 
              onClick={startConversation} 
              style={{
                padding: '12px 30px',
                fontSize: '1.1rem',
                borderRadius: '30px',
                boxShadow: '0 4px 8px rgba(0, 128, 0, 0.4)',
                transition: 'transform 0.3s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FaCommentDots style={{ marginRight: '10px' }} />
              Démarrer la conversation
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Section des avantages de ChatApp */}
      <Container fluid style={{ backgroundColor: '#f4f4f4', padding: '50px 0' }}>
        <Row className="text-center">
          <Col md={4}>
            <Image 
              src="../public/images/18091594.png" 
              alt="Avantage 1 - Conversations Instantanées" 
              fluid 
              style={{ maxHeight: '250px', objectFit: 'cover' }} 
            />
            <h4 className="mt-3">Conversations Instantanées</h4>
            <p style={{ color: '#555' }}>ChatApp te permet de discuter avec tes amis en temps réel, où que tu sois.</p>
          </Col>
          <Col md={4}>
            <Image 
              src="../public/images/simple.pdf.webp" 
              alt="Avantage 2 - Simplicité d'utilisation" 
              fluid 
              style={{ maxHeight: '250px', objectFit: 'cover' }} 
            />
            <h4 className="mt-3">Simplicité d'utilisation</h4>
            <p style={{ color: '#555' }}>Une interface claire et intuitive, pour que tu puisses commencer à discuter en quelques secondes.</p>
          </Col>
          <Col md={4}>
            <Image 
              src="../public/images/4413151-illustration.jpg"
              alt="Avantage 3 - Groupes de Discussion" 
              fluid 
              style={{ maxHeight: '250px', objectFit: 'cover' }} 
            />
            <h4 className="mt-3">Groupes de Discussion</h4>
            <p style={{ color: '#555' }}>Rejoins ou crée des groupes de discussion pour échanger facilement avec plusieurs amis à la fois.</p>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
