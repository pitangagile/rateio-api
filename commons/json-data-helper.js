const getObjectPropertyValue = require('./utilities').getObjectPropertyValue;

function filter(dataSource, query, columns) {
  if(!dataSource) return [];
  if(!query) return dataSource;

  if(columns) {
    if(typeof columns === 'string') {
      return dataSource.filter(row => (getObjectPropertyValue(row, columns) + "").toLocaleLowerCase().trim().indexOf(query.toLocaleLowerCase().trim()) >= 0);
    } else {
      return dataSource.filter(row => {
        for(const col of columns)
          if((getObjectPropertyValue(row, col) + "").toLocaleLowerCase().trim().indexOf(query.toLocaleLowerCase().trim()) >= 0) return true;

        return false;
      });
    }
  } else {
    return dataSource.filter(row => {
      for(const col in row)
        if((getObjectPropertyValue(row, col) + "").toLocaleLowerCase().trim().indexOf(query.toLocaleLowerCase().trim()) >= 0) return true;

      return false;
    });
  }
}

function sort(dataSource, ascending, column) {
  if(!dataSource) return [];
  if(!column) return dataSource;

  const ascendingSort = (a, b) => {
    return getObjectPropertyValue(a, column) > getObjectPropertyValue(b, column)
      ? 1
      : getObjectPropertyValue(b, column) > getObjectPropertyValue(a, column) ? -1 : 0;
  };
  const descendingSort = (a, b) => {
    return getObjectPropertyValue(a, column) > getObjectPropertyValue(b, column)
      ? -1
      : getObjectPropertyValue(b, column) > getObjectPropertyValue(a, column) ? 1 : 0;
  };
  const sortFunction = ascending ? ascendingSort : descendingSort;

  return dataSource.sort(sortFunction);
}

function limitData(dataSource, page, limit) {
  if(!dataSource) return [];

  let end = page * limit;
  let start = end - limit;

  return dataSource.slice(start, end);
}

function Helper(dataSource) {
  this.data = dataSource || [];
  this.count = this.data.length;

  this.filter = function(query, column) {
    this.data = filter(this.data, query, column);
    this.count = this.data.length;

    return this;
  }

  this.sort = function(ascending, columns) {
    this.data = sort(this.data, ascending, columns);

    return this;
  }

  this.limitData = function(page, limit) {
    this.data = limitData(this.data, page, limit);

    return this;
  }
}

module.exports = {
  filter,
  sort,
  limitData,
  Helper,
};
