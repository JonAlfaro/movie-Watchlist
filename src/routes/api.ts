import * as express from "express";
import pgPromise from "pg-promise";

export const register = ( app: express.Application ) => {
    const oidc = app.locals.oidc;
    const port = parseInt( process.env.PGPORT || "5432", 10 );
    const config = {
        database: process.env.PGDATABASE || "postgres",
        host: process.env.PGHOST || "localhost",
        port,
        user: process.env.PGUSER || "postgres"
    };

    const pgp = pgPromise();
    const db = pgp( config );

    app.get( `/api/movies/all`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const movies = await db.any( `
                SELECT
                    id
                    , title
                    , year
                    , imdb_link
                    , imdb_score
                FROM    movies
                WHERE   user_id = $[userId]
                ORDER BY title, year`, { userId } );
            return res.json( movies );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.get( `/api/movies/total`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const total = await db.one( `
            SELECT  count(*) AS total
            FROM    movies
            WHERE   user_id = $[userId]`, { userId }, ( data: { total: number } ) => {
                return {
                    total: +data.total
                };
            } );
            return res.json( total );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.get( `/api/movies/find/:search`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const movies = await db.any( `
                SELECT
                    id
                    , title
                    , year
                    , imdb_link
                    , imdb_score
                FROM    movies
                WHERE   user_id = $[userId]
                AND   ( title ILIKE $[search] )`,
                { userId, search: `%${ req.params.search }%` } );
            return res.json( movies );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.post( `/api/movies/add`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one( `
                INSERT INTO movies( user_id, title, year, imdb_link, imdb_score )
                VALUES( $[userId], $[title], $[year], $[imdb_link], $[imdb_score] )
                RETURNING id;`,
                { userId, ...req.body  } );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.post( `/api/movies/update`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.one( `
                UPDATE movies
                SET title = $[title]
                    , year = $[year]
                    , imdb_link = $[imdb_link]
                    , imdb_score = $[imdb_score]
                WHERE
                    id = $[id]
                    AND user_id = $[userId]
                RETURNING
                    id;`,
                { userId, ...req.body  } );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

    app.delete( `/api/movies/remove/:id`, oidc.ensureAuthenticated(), async ( req: any, res ) => {
        try {
            const userId = req.userContext.userinfo.sub;
            const id = await db.result( `
                DELETE
                FROM    movies
                WHERE   user_id = $[userId]
                AND     id = $[id]`,
                { userId, id: req.params.id  }, ( r ) => r.rowCount );
            return res.json( { id } );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );
};
