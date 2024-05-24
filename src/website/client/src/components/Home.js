// src/website/client/src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a href="/auth/discord">Login with Discord</a>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img src="https://cdn.discordapp.com/attachments/1243553220387803206/1243553264494968923/03cb6922d5bd77418daa85e22319ca08ef5c713a.jpg?ex=6651e4ba&is=6650933a&hm=6db433b5cd1e907c10e9c5d065e6c3853abb8bb9ef40f9687cb711b4df2def77&" alt="Evi" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/subscribe">Subscribe to Bot</Link>
      </div>
    </div>
  );
}

export default Home;
