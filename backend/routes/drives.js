router.post('/:id/waitlist', authMiddleware, async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) return res.status(404).json({ error: 'Drive not found' });
  if (drive.waitlist.includes(req.user.id))
    return res.status(400).json({ error: 'Already on waitlist' });
  drive.waitlist.push(req.user.id);
  await drive.save();
  res.json({ message: 'Added to waitlist' });
});