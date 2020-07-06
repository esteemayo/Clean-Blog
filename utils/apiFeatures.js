class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // Filtering
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete excludedFields[el]);

        // console.log(queryObj);

        // Advance filering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.match(/\b(gte|gt|lte|lt)\b/, match => `$${match}`);
        // console.log(JSON.parse(queryStr));

        // let query = Post.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // Sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        // Field limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);


        /** 
             if (this.queryString.page) {
                 const counts = await Post.countDocuments();
                 if (skip >= counts) throw new Error('This page does not exist');
             }
        */
       return this;
    }
};

module.exports = APIFeatures;