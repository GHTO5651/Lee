const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// ✅ MongoDB 연결
mongoose.connect('mongodb+srv://junehui07122:sh21441612@cluster0.kcklp5k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error(err));

// ✅ 게시글 스키마
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  size: String,
  color: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// ✅ 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ 페이지 라우팅
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/write', (req, res) => res.sendFile(__dirname + '/public/write.html'));
app.get('/post/:id/view', (req, res) => res.sendFile(__dirname + '/public/detail.html')); // 또는 view.html

// ✅ 게시글 API
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, size, color } = req.body;
    const post = await Post.create({ title, content, size, color });
    res.status(201).json(post);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '글 저장 실패' });
  }
});

app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts.map(p => ({ id: p._id, title: p.title })));
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Not found');
    res.json(post);
  } catch (e) {
    res.status(400).send('잘못된 ID');
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send('삭제할 수 없음');
    res.sendStatus(200);
  } catch {
    res.status(400).send('삭제 실패');
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, content, size, color } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, {
      title, content, size, color
    }, { new: true });
    if (!post) return res.status(404).send('수정할 수 없음');
    res.json(post);
  } catch (e) {
    res.status(400).send('수정 실패');
  }
});

// ✅ 서버 시작
app.listen(8080, () => console.log('Server running on http://localhost:8080'));
