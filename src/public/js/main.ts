import axios from "axios";
import * as M from "materialize-css";
import Vue from "vue";

// tslint:disable-next-line no-unused-expression
new Vue( {
    computed: {
        hazMovies(): boolean {
            return this.isLoading === false && this.movies.length > 0;
        },
        noMovies(): boolean {
            return this.isLoading === false && this.movies.length === 0;
        }
    },
    data() {
        return {
            title: "",
            year: "",
            movies: [],
            isLoading: true,
            imdb_link: "",
            selectedMovie: "",
            selectedMovieId: 0,
            imdb_score: ""
        };
    },
    el: "#app",
    methods: {
        addMovie() {
            const movie = {
                title: this.title,
                year: this.year,
                imdb_link: this.imdb_link,
                imdb_score: this.imdb_score
            };
            axios
                .post( "/api/movies/add", movie )
                .then( () => {
                    this.$refs.year.focus();
                    this.title = "";
                    this.year = "";
                    this.imdb_link = "";
                    this.imdb_score = "";
                    this.loadMovies();
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        confirmDeleteMovie( id: string ) {
            const movie = this.movies.find( ( g ) => g.id === id );
            this.selectedMovie = `${ movie.year } ${ movie.title }`;
            this.selectedMovieId = movie.id;
            const dc = this.$refs.deleteConfirm;
            const modal = M.Modal.init( dc );
            modal.open();
        },
        deleteMovie( id: string ) {
            axios
                .delete( `/api/movies/remove/${ id }` )
                .then( this.loadMovies )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        },
        loadMovies() {
            axios
                .get( "/api/movies/all" )
                .then( ( res: any ) => {
                    this.isLoading = false;
                    this.movies = res.data;
                } )
                .catch( ( err: any ) => {
                    // tslint:disable-next-line:no-console
                    console.log( err );
                } );
        }
    },
    mounted() {
        return this.loadMovies();
    }
} );