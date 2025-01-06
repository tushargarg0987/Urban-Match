export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white p-4" style={{height: '6vh'}}>
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} MatchMaker. All rights reserved.</p>
        </div>
      </footer>
    );
  }
  