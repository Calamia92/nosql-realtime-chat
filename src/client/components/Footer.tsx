import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: "#333", color: "white", padding: "20px 0", marginTop: "auto" }}>
      <Container>
        <Row>
          <Col md={4} className="text-center text-md-left">
            <h5>ChatApp</h5>
            <p>© 2025 ChatApp. Tous droits réservés.</p>
          </Col>
          <Col md={4} className="text-center">
            <h5>Liens utiles</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white">À propos</a></li>
              <li><a href="#" className="text-white">Support</a></li>
              <li><a href="#" className="text-white">Politique de confidentialité</a></li>
            </ul>
          </Col>
          <Col md={4} className="text-center text-md-right">
            <h5>Suivez-nous</h5>
            <div>
              <a href="#" className="text-white mx-2">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-white mx-2">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-white mx-2">
                <FaInstagram size={24} />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
