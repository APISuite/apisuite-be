const addFindAllPaginated = (Model) => {
  return async ({ page = null, pageSize = null, options = {} }) => {
    let _page = page || 1
    _page = page > 0 ? _page : 1
    let _pageSize = pageSize || 10
    _pageSize = _pageSize > 0 ? _pageSize : 10
    const models = await Model.findAndCountAll({
      ...options,
      limit: _pageSize,
      offset: (_page - 1) * _pageSize,
    })

    return {
      rows: models.rows || [],
      pagination: {
        rowCount: models.count || 0,
        pageCount: Math.ceil((models.count || 0) / _pageSize),
        page: _page,
        pageSize: _pageSize,
      },
    }
  }
}

module.exports = {
  addFindAllPaginated,
}
