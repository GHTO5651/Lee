const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // ✅ 추가

// 🔐 여기에 본인 URI 넣기
mongoose.connect('mongodb+srv://junehui07122:sh21441612@cluster0.kcklp5k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error(err));

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  size: String,
  color: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let posts = []; // 임시 저장

try {
  const data = fs.readFileSync('posts.json', 'utf8');
  posts = JSON.parse(data);
} catch (e) {
  console.log('저장된 게시물이 없습니다.');
}

// 글 저장 시 파일에도 저장
function savePosts() {
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
}

app.listen(8080, function () {
  console.log('Server running on http://localhost:8080');
});

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 글 저장
app.post('/write', async (req, res) => {
  const { title, content } = req.body;
  await Post.create({ title, content });
  res.redirect('/');
});


// 전체 글 목록
app.get('/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts.map(post => ({
    id: post._id,
    title: post.title
  })));
});


// 글 상세 데이터
app.get('/post/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('글을 찾을 수 없음');
  res.json(post);
});


// 글 보기 페이지
app.get('/post/:id/view', (req, res) => {
  res.sendFile(__dirname + '/public/view.html');
});

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/public/write.html');
});

app.post('/write', (req, res) => {
  const { title, content } = req.body;
  const id = location.pathname.split('/').pop() || '기본값';

  posts.unshift({ id, title, content });
  savePosts();  // 글 저장할 때마다 파일에 저장
  res.redirect('/');
});

// 📌 글 저장 API
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, size, color } = req.body;
    const post = await Post.create({ title, content, size, color });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '글 저장 실패' });
  }
});

// 📌 글 목록 API
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts.map(post => ({
    _id: post._id,
    title: post.title
  })));
}); 

// 📌 글 조회 API
app.get('/api/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('글을 찾을 수 없습니다.');
  res.json(post);
});

// 📌 글 삭제 API
app.delete('/api/posts/:id', async (req, res) => {
  const result = await Post.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).send('삭제할 글을 찾을 수 없습니다.');
  res.sendStatus(200);
});

//dddd
