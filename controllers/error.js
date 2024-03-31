exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '' })
}

exports.get500 = (req, res, next) => {
  res.status(505).render('500', { pageTitle: 'some error ocurred', path: '/500' })
}
