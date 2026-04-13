const { db } = require('../db/database');

function runTest() {
  console.log('Clearing old test data...');
  db.exec("DELETE FROM activities WHERE project = 'TestProject'");
  db.exec("DELETE FROM decisions WHERE tags LIKE '%test%'");
  db.exec("DELETE FROM focus_sessions WHERE task_name LIKE 'Test:%'");
  db.exec("DELETE FROM context_cache");

  console.log('Generating complex mock data for Knowledge Graph...');
  
  const files = [
    '/frontend/src/auth/login.jsx',
    '/frontend/src/auth/signup.jsx',
    '/frontend/src/api/auth.js',
    '/frontend/src/components/Button.jsx',
    '/frontend/src/components/Input.jsx',
    '/frontend/src/store/userStore.js',
    '/frontend/src/utils/validation.js',
    '/backend/routes/auth.js',
    '/backend/controllers/authController.js',
    '/backend/models/User.js',
    '/backend/services/jwt.js',
    '/backend/middleware/auth.js'
  ];

  let baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

  function addActivity(filePath, timeOffsetMs, type = 'file_modified', content = 'Mock code change') {
    db.prepare('INSERT INTO activities (type, file_path, project, content, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(type, filePath, 'TestProject', content, JSON.stringify({}), baseTime + timeOffsetMs);
  }

  // Generate activities
  const clusters = [
    { name: 'UI', files: files.slice(0, 5), timeOffset: 0 },
    { name: 'Store', files: [files[0], files[1], files[2], files[5]], timeOffset: 60 * 60 * 1000 },
    { name: 'Backend', files: files.slice(7), timeOffset: 2 * 60 * 60 * 1000 },
    { name: 'Integration', files: [files[2], files[7], files[8]], timeOffset: 3 * 60 * 60 * 1000 }
  ];

  clusters.forEach((cluster) => {
    // For each cluster, we simulate 10 bursts of activity
    for (let i = 0; i < 15; i++) {
      let burstTime = cluster.timeOffset + (i * 10 * 60 * 1000); // 10 mins apart
      
      // In each burst, touch 3-6 random files from the cluster within a 2-minute window
      let numFiles = 3 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numFiles; j++) {
        let file = cluster.files[Math.floor(Math.random() * cluster.files.length)];
        let exactTime = burstTime + Math.floor(Math.random() * 2 * 60 * 1000); // within 2 mins
        addActivity(file, exactTime);
      }
    }
  });

  // Adding very recent activity so Context Resume picks it up as top items
  const recentTime = Date.now() - 10000;
  addActivity('/frontend/src/auth/login.jsx', recentTime - baseTime, 'file_opened');
  addActivity('/backend/routes/auth.js', recentTime - baseTime + 1000, 'file_opened');
  addActivity('/backend/controllers/authController.js', recentTime - baseTime + 2000, 'file_modified');

  console.log('Generating Decisions...');
  db.prepare('INSERT INTO decisions (title, description, rationale, files_affected, tags, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('Use JWT for Auth', 'We will use JWT tokens stored in HttpOnly cookies.', 'More secure than localStorage for SSR apps.', JSON.stringify(['/backend/services/jwt.js', '/backend/middleware/auth.js', '/frontend/src/api/auth.js']), JSON.stringify(['auth', 'security', 'test']), baseTime + 2.5 * 60 * 60 * 1000);

  console.log('Generating Focus Sessions...');
  db.prepare("INSERT INTO focus_sessions (task_name, started_at, ended_at, summary, files_touched, status) VALUES (?, ?, ?, ?, ?, 'completed')")
    .run('Test: Build Backend Auth', baseTime + 2 * 60 * 60 * 1000, baseTime + 2.8 * 60 * 60 * 1000, 'Implemented JWT auth and user models.', JSON.stringify(files.slice(7)));

  console.log('Complex test data generated successfully!');
  console.log(`Knowledge Graph should now show ${files.length} nodes with strong connections.`);
  console.log(`Check Context Resume for /frontend/src/auth/login.jsx or /backend/routes/auth.js`);
}

runTest();
