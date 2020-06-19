/* jshint jasmine:true */
/* globals Immutable, videos */

(function (Immutable, videos) {
    'use strict';

    describe('videos', function () {

        function immutableJsTester(first, second) {
            if (first instanceof Immutable.Collection && second instanceof Immutable.Collection) {
                return first.equals(second);
            }
        }

        beforeEach(function () {
            jasmine.addCustomEqualityTester(immutableJsTester);
        });

        it('decomposes video identifiers', function () {
            expect(videos.getSiteName('youtube_e4TFD2PfVPw')).toBe('youtube'); 
            expect(videos.getId('youtube_e4TFD2PfVPw')).toBe('e4TFD2PfVPw');

            expect(videos.getSiteName('vimeo_123')).toBe('vimeo');
            expect(videos.getId('vimeo_123')).toBe('123');
        });

        it('ensures that a video storage conforms to the current schema version', function () {
            expect(videos.SCHEMA_VERSION).toBe(2);

            const nullStorage = null;
            let undefinedStorage;
            const nullStorageResult = Immutable.Map.of(
                'schemaVersion', videos.SCHEMA_VERSION,
                'videos', Immutable.Map());
            expect(videos.ensureSchema(nullStorage)).toEqual(nullStorageResult);
            expect(videos.ensureSchema(undefinedStorage)).toEqual(nullStorageResult);

            const storageWithSchemaVersion1 = Immutable.fromJS({
                'schemaVersion': 1,
                'videos': {
                    'youtube_1234': {
                        'title': 'Test',
                        'vid': 'youtube_1234',
                        'time': '123',
                        'lastModified': 0
                    }
                }
            });
            const storageWithSchemaVersion2 = Immutable.fromJS({
                'schemaVersion': 2,
                'videos': {
                    'youtube_1234': {
                        'title': 'Test',
                        'vid': 'youtube_1234',
                        'time': 123, // time is converted to a number
                        'lastModified': 0
                    }
                }
            });

            expect(videos.ensureSchema(storageWithSchemaVersion1)).toEqual(storageWithSchemaVersion2);
        });

        it('adds, retrieves or removes videos to/from the storage', function () {
            jasmine.clock().install();
            const baseDate = new Date(0);
            jasmine.clock().mockDate(baseDate);

            const vid = 'youtube_1234';
            const title = 'Test';
            const time1 = 123;
            const video1 = Immutable.Map.of(
                'vid', vid,
                'title', title,
                'time', time1 
            );
            let storage = videos.ensureSchema(null);

            // Adding a video and retrieving the same video
            storage = videos.add(storage, video1);
            const retrievedVideo1 = videos.get(storage, vid);
            expect(retrievedVideo1.get('vid')).toBe(vid);
            expect(retrievedVideo1.get('title')).toBe(title);
            expect(retrievedVideo1.get('time')).toBe(time1);
            const lastModified1 = retrievedVideo1.get('lastModified');
            expect(lastModified1).toBe(0);

            // Updating a video by adding a video with the same id
            jasmine.clock().tick(1);
            const time2 = 321;
            const video2 = video1.set('time', time2);
            storage = videos.add(storage, video2);
            const retrievedVideo2 = videos.get(storage, vid);
            const lastModified2 = retrievedVideo2.get('lastModified');
            expect(lastModified2).toBe(baseDate.getTime() + 1);

            // Removing a video
            storage = videos.remove(storage, vid);
            const retrievedVideo3 = videos.get(storage, vid);
            expect(retrievedVideo3).toBeUndefined();

            jasmine.clock().uninstall();
        });

        it('(optionally) keeps only one video per playlist', function () {
            const playlistId = 'foo';

            const vid1 = 'youtube_1';
            const title1 = 'Test 1';
            const time1 = 123;
            const video1 = Immutable.Map.of(
                'vid', vid1,
                'title', title1,
                'time', time1,
                'playlistId', playlistId
            );

            const vid2 = 'youtube_2';
            const title2 = 'Test 2';
            const time2 = 321;
            const video2 = Immutable.Map.of(
                'vid', vid2,
                'title', title2,
                'time', time2,
                'playlistId', playlistId
            );

            let storage = videos.ensureSchema(null);
            storage = videos.add(storage, video1);
            storage = videos.add(storage, video2, true);
            expect(videos.get(storage, vid1)).toBeUndefined();
            const retrievedVideo = videos.get(storage, vid2);
            expect(retrievedVideo.get('vid')).toBe(vid2);
            expect(retrievedVideo.get('title')).toBe(title2);
            expect(retrievedVideo.get('time')).toBe(time2);
            expect(retrievedVideo.get('lastModified')).toBeGreaterThan(0);
            expect(retrievedVideo.get('playlistId')).toBe(playlistId);
        });
    });

})(Immutable, videos);